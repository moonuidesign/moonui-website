import { db } from '@/libs/drizzle';
import { licenses, users } from '@/db/migration/schema';
import { sendExpirationNoticeEmail } from '@/libs/mail';
import { and, between, eq, sql } from 'drizzle-orm';
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

    // Find licenses expiring exactly 7 days from now
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
          eq(licenses.planType, 'subscribe'), // Only check subscriptions
          eq(licenses.status, 'active'),
          between(licenses.expiresAt, startOfDay, endOfDay),
        ),
      );

    console.log(
      `Found ${expiringLicenses.length} licenses expiring in 7 days.`,
    );

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
      message: `Processed ${expiringLicenses.length} expiring licenses. Sent ${sentCount} emails.`,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
