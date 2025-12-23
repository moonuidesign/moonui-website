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
import { users } from '@/db/migration';
import { eq } from 'drizzle-orm';

const getOtpKey = (licenseKey: string) => `otp:${licenseKey}`;

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

    const session = await auth();
    if (session?.user?.id) {
      return {
        code: 400,
        success: false,
        message: 'Kamu sudah login, lisensi tidak dapat diaktifkan.',
        url: '/',
      };
    }

    // Cek apakah email sudah terdaftar di database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return {
        code: 400,
        success: false,
        message: 'Email ini sudah terdaftar. Silakan login atau gunakan license key yang berbeda.',
        url: '/verify-license',
      };
    }

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
      message: 'OTP verified successfully.',
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
