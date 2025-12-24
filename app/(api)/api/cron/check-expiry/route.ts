import { db } from '@/libs/drizzle';
import { licenses, users } from '@/db/migration';
import { sendExpirationNoticeEmail } from '@/libs/mail';
import { and, between, eq, lt } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Create start and end of the 7th day
    const startOfDay = new Date(sevenDaysFromNow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(sevenDaysFromNow.setHours(23, 59, 59, 999));

    // ================================================================
    // TASK 1: Mark expired licenses as 'expired' in database
    // This ensures session licenseStatus is updated on next login/refresh
    // ================================================================
    const expiredLicenses = await db
      .update(licenses)
      .set({ status: 'expired' })
      .where(
        and(
          eq(licenses.status, 'active'),
          lt(licenses.expiresAt, now)
        )
      )
      .returning({ id: licenses.id, userId: licenses.userId });

    console.log(`Marked ${expiredLicenses.length} licenses as expired.`);

    // ================================================================
    // TASK 2: Send notification emails for licenses expiring in 7 days
    // ================================================================
    const expiringLicenses = await db
      .select({
        licenseKey: licenses.licenseKey,
        expiresAt: licenses.expiresAt,
        userId: licenses.userId,
        email: users.email,
        planType: licenses.planType,
      })
      .from(licenses)
      .leftJoin(users, eq(licenses.userId, users.id))
      .where(
        and(
          eq(licenses.planType, 'subscribe'),
          eq(licenses.status, 'active'),
          between(licenses.expiresAt, startOfDay, endOfDay),
        ),
      );
    console.log(`Found ${expiringLicenses.length} licenses expiring in 7 days.`);
    const results = await Promise.allSettled(
      expiringLicenses.map(async (record) => {
        if (record.email) {
          await sendExpirationNoticeEmail(record.email, 7);
          return record.email;
        }
      }),
    );

    const sentCount = results.filter((r) => r.status === 'fulfilled').length;

    return NextResponse.json({
      success: true,
      message: `Marked ${expiredLicenses.length} licenses as expired. Processed ${expiringLicenses.length} expiring licenses. Sent ${sentCount} notification emails.`,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
