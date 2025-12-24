'use server';

import { redirect } from 'next/navigation';
import {
  LicenseValidationSchema,
  licenseValidationSchema,
  otpVerificationSchema,
  OtpVerificationSchema,
} from '@/types/validate';
import { validateLicenseKey } from './validate';
import {
  generateLicenseSignature,
  verifyLicenseSignature,
} from '@/libs/signature';
import { ResponseAction } from '@/types/response-action';
import redis from '@/libs/redis-local';
import { auth } from '@/libs/auth';
import { sendVerificationEmail } from '@/libs/mail';
import { db } from '@/libs/drizzle';
import { users, licenses, licenseTransactions } from '@/db/migration';
import { eq, and } from 'drizzle-orm';

const getOtpKey = (licenseKey: string) => `otp:${licenseKey}`;

/**
 * Helper function untuk memperbarui license user di database
 */
async function renewLicenseForUser(
  userId: string,
  licenseKey: string,
  tier: string,
  planType: string,
  orderId: number,
) {
  // Map planType ke enum database
  const dbPlanType: 'subscribe' | 'one_time' =
    planType === 'one_time' || planType === 'lifetime' ? 'one_time' : 'subscribe';

  await db.transaction(async (tx) => {
    // Deaktifkan semua license lama user ini
    await tx
      .update(licenses)
      .set({
        status: 'expired',
        updatedAt: new Date(),
      })
      .where(and(
        eq(licenses.userId, userId),
        eq(licenses.status, 'active')
      ));

    // Cek apakah license key ini sudah ada untuk user ini
    const existingLicense = await tx.query.licenses.findFirst({
      where: eq(licenses.licenseKey, licenseKey),
    });

    let licenseId: string;

    if (existingLicense && existingLicense.userId === userId) {
      // Update license yang ada
      await tx
        .update(licenses)
        .set({
          status: 'active',
          tier: 'pro' as const,
          planType: dbPlanType,
          activatedAt: new Date(),
          expiresAt: dbPlanType === 'one_time'
            ? null
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        })
        .where(eq(licenses.id, existingLicense.id));
      licenseId = existingLicense.id;
    } else {
      // Insert license baru
      const [newLicense] = await tx.insert(licenses).values({
        userId,
        licenseKey,
        status: 'active',
        tier: 'pro' as const,
        planType: dbPlanType,
        activatedAt: new Date(),
        expiresAt: dbPlanType === 'one_time'
          ? null
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }).returning({ id: licenses.id });
      licenseId = newLicense.id;
    }

    // Insert transaction record
    await tx.insert(licenseTransactions).values({
      userId,
      licenseId,
      transactionType: existingLicense ? 'renewal' : 'activation',
      amount: 0, // Amount will be fetched from Lemon Squeezy if needed
      status: 'success',
      metadata: {
        orderId,
        licenseKey,
        planType: dbPlanType,
        tier: 'pro',
        activatedAt: new Date().toISOString(),
      },
    });
  });

  console.log(`[renewLicenseForUser] License renewed for user ${userId} with orderId ${orderId}`);
}

export async function validateLicenseAction(
  data: LicenseValidationSchema,
): Promise<ResponseAction<null>> {
  try {
    const validatedFields = licenseValidationSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        code: 400,
        message: 'Invalid license key format.',
      };
    }

    const { licenseKey } = validatedFields.data;
    const result = await validateLicenseKey(licenseKey);

    if (!result.success || !result.data) {
      return {
        success: false,
        code: result.code || 400,
        message:
          (Array.isArray(result.message)
            ? result.message.join(', ')
            : result.message) || 'License validation failed.',
      };
    }

    const { customer_email } = result.data.meta;
    const licenseStatus = result.data.license_key?.status;
    const activationUsage = result.data.license_key?.activation_usage || 0;

    // ================================================================
    // CHECK 1: Apakah license key BARU ini sudah ada di database kita?
    // Jika license key yang SAMA sudah pernah digunakan, tidak bisa dipakai lagi
    // ================================================================
    const existingLicenseInDb = await db.query.licenses.findFirst({
      where: eq(licenses.licenseKey, licenseKey),
    });

    if (existingLicenseInDb) {
      return {
        success: false,
        code: 409,
        message: 'This license key has already been used. Each license key can only be activated for one account.',
        url: '/signin',
      };
    }

    // ================================================================
    // CHECK 2: Cek status license dari Lemon Squeezy API
    // Jika sudah 'active' artinya sudah diaktivasi di tempat lain
    // ================================================================
    if (licenseStatus === 'active') {
      return {
        success: false,
        code: 409,
        message: 'This license key has already been activated. If you own this account, please sign in.',
        url: '/signin',
      };
    }

    // ================================================================
    // CHECK 3: Apakah email dari license sudah terdaftar di database?
    // ================================================================
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, customer_email),
    });

    if (existingUser) {
      // Email sudah terdaftar - cek status license user ini
      const userLicense = await db.query.licenses.findFirst({
        where: eq(licenses.userId, existingUser.id),
        orderBy: (licenses, { desc }) => [desc(licenses.createdAt)],
      });

      if (userLicense) {
        const now = new Date();
        const isExpired = userLicense.status === 'expired';
        const isExpiresAtPassed = userLicense.expiresAt && new Date(userLicense.expiresAt) < now;

        // CASE A: License masih aktif (belum expired)
        if (userLicense.status === 'active' && !isExpiresAtPassed) {
          return {
            success: false,
            code: 409,
            message: 'This account already has an active license. Please sign in to access premium features.',
            url: '/signin',
          };
        }

        // CASE B: License sudah expired (status expired ATAU expires_at sudah lewat)
        if (isExpired || isExpiresAtPassed) {
          return {
            success: false,
            code: 200,
            message: 'Your license has expired. Please sign in and enter your new license key to renew.',
            url: '/signin',
          };
        }
      }

      // CASE C: User ada tapi belum punya license sama sekali
      // Arahkan untuk login dan aktivasi license baru
      return {
        success: false,
        code: 200,
        message: 'An account with this email already exists. Please sign in, then enter your license key to activate.',
        url: '/signin',
      };
    }

    // ================================================================
    // CASE 4: Email belum terdaftar = User baru
    // Lanjutkan dengan OTP flow untuk signup
    // ================================================================

    // Email belum terdaftar - lanjutkan dengan OTP flow untuk signup
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in Redis
    await redis.set(getOtpKey(licenseKey), otp, 'EX', 600);

    // Send OTP via Email
    await sendVerificationEmail(customer_email, otp);

    const signature = await generateLicenseSignature(
      customer_email,
      otp,
      licenseKey,
      expiresAt,
      result.data.app_tier!,
      result.data.app_plan_type!,
      result.data.meta.order_id,
    );

    // Use redirect (throws error, so do it last or catch it if needed, but in server action it's fine)
    redirect(`/verify-license/otp?signature=${encodeURIComponent(signature)}`);
  } catch (error) {
    // Redirect throws an error instance of 'NEXT_REDIRECT'
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Validate License Error:', error);
    return {
      success: false,
      code: 500,
      message: 'Internal server error during license validation.',
    };
  }
}

export async function verifyOtpAction(
  data: OtpVerificationSchema,
): Promise<ResponseAction<null | string>> {
  try {
    const validatedFields = otpVerificationSchema.safeParse(data);
    if (!validatedFields.success) {
      return { success: false, code: 400, message: 'Invalid Input' };
    }

    const { otp, signature } = validatedFields.data;
    const verificationResult = await verifyLicenseSignature(signature);

    if (!verificationResult.valid || !verificationResult.payload) {
      return {
        success: false,
        code: 400,
        message: 'Invalid verification link.',
      };
    }

    if (verificationResult.expired) {
      return {
        success: false,
        code: 400,
        message: 'Verification link has expired.',
      };
    }

    const { email, licenseKey, tier, planType, orderId } = verificationResult.payload;
    const storedOtp = await redis.get(getOtpKey(licenseKey));

    if (!storedOtp) {
      return {
        success: false,
        code: 400,
        message: 'OTP has expired or invalid.',
      };
    }

    if (storedOtp !== otp) {
      return { success: false, code: 400, message: 'Incorrect OTP code.' };
    }

    await redis.del(getOtpKey(licenseKey));
    console.log(`OTP for license ${licenseKey} verified.`);

    // Cek session user yang sedang login
    const session = await auth();

    // Cek apakah email dari license sudah terdaftar di database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // ================================================================
    // CASE 1: User sudah login
    // ================================================================
    if (session?.user?.id) {
      const loggedInUserId = session.user.id;
      const loggedInEmail = session.user.email;

      // Ensure license email matches logged-in user email
      if (loggedInEmail?.toLowerCase() !== email.toLowerCase()) {
        return {
          code: 400,
          success: false,
          message: 'This license key is registered to a different email. Please use the license key that matches your account.',
        };
      }

      // Langsung perbarui license untuk user yang login
      await renewLicenseForUser(loggedInUserId, licenseKey, tier, planType, orderId);

      return {
        code: 200,
        success: true,
        message: 'Congratulations! Your license has been successfully renewed. Please refresh the page to see the changes.',
        data: null,
        url: '/',
      };
    }

    // ================================================================
    // CASE 2: User belum login TAPI email sudah ada di database
    // -> Auto-renewal (tidak perlu signup)
    // ================================================================
    if (existingUser) {
      // Langsung perbarui license untuk user yang sudah ada
      await renewLicenseForUser(existingUser.id, licenseKey, tier, planType, orderId);

      return {
        code: 200,
        success: true,
        message: 'License successfully renewed! Please sign in to access premium features.',
        data: null,
        url: '/signin',
      };
    }

    // ================================================================
    // CASE 3: User belum login DAN email belum terdaftar
    // -> Redirect ke signup untuk membuat akun baru
    // ================================================================
    const activationExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const activationSignature = await generateLicenseSignature(
      email,
      'activation-pass',
      licenseKey,
      activationExpiresAt,
      tier,
      planType,
      orderId,
    );

    return {
      code: 200,
      success: true,
      message: 'OTP verified. Silakan lengkapi pendaftaran untuk mengaktifkan lisensi.',
      data: activationSignature,
      url: `/signup?signature=${encodeURIComponent(activationSignature)}`,
    };
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return {
      success: false,
      code: 500,
      message: 'An unexpected error occurred.',
    };
  }
}

export async function resendOtpAction(
  currentSignature: string,
): Promise<ResponseAction<{ newSignature: string }>> {
  try {
    if (!currentSignature) {
      return {
        code: 400,
        success: false,
        message: 'Missing signature. Please start over.',
      };
    }

    const verificationResult = await verifyLicenseSignature(currentSignature);
    if (!verificationResult.valid || !verificationResult.payload) {
      return {
        code: 400,
        success: false,
        message: 'Invalid signature. Please start over.',
      };
    }

    const { email, licenseKey, tier, planType, orderId } = verificationResult.payload;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update Redis
    await redis.set(getOtpKey(licenseKey), newOtp, 'EX', 600);

    // Send Email
    await sendVerificationEmail(email, newOtp);

    const newSignature = await generateLicenseSignature(
      email,
      newOtp,
      licenseKey,
      newExpiresAt,
      tier,
      planType,
      orderId,
    );

    return {
      code: 200,
      success: true,
      message: 'A new OTP has been sent to your email.',
      data: { newSignature },
    };
  } catch (error) {
    console.error('Resend OTP Error:', error);
    return { success: false, code: 500, message: 'Failed to resend OTP.' };
  }
}
