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
import { auth } from '@/libs/auth'; // Import auth
import { db } from '@/libs/drizzle';
import { licenses, licenseTransactions } from '@/db/migration/schema';
import { eq } from 'drizzle-orm';
import { activateLicense } from '../Activate/activate'; // Import activateLicense

const getOtpKey = (licenseKey: string) => `otp:${licenseKey}`;

export async function validateLicenseAction(
  data: LicenseValidationSchema,
): Promise<ResponseAction<void>> {
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
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit
  console.log(`[DEV ONLY] OTP for ${customer_email} is: ${otp}`);

  await redis.set(getOtpKey(licenseKey), otp, 'EX', 600);
  const signature = await generateLicenseSignature(
    customer_email,
    otp,
    licenseKey,
    expiresAt,
  );

  redirect(`/verify-license/otp?signature=${encodeURIComponent(signature)}`);
}

export async function verifyOtpAction(
  data: OtpVerificationSchema,
): Promise<ResponseAction<string>> {
  const validatedFields = otpVerificationSchema.safeParse(data);
  if (!validatedFields.success) throw new Error('Invalid OTP or signature.');

  const { otp, signature } = validatedFields.data;
  const verificationResult = await verifyLicenseSignature(signature);
  if (
    !verificationResult.valid ||
    !verificationResult.payload ||
    verificationResult.expired
  ) {
    throw new Error('Verification link is invalid or has expired.');
  }

  const { email, licenseKey } = verificationResult.payload;
  const storedOtp = await redis.get(getOtpKey(licenseKey));
  if (storedOtp !== otp) throw new Error('The OTP is incorrect.');

  await redis.del(getOtpKey(licenseKey));
  console.log(
    `OTP for license ${licenseKey} verified. Generating activation ticket.`,
  );

  // Check if user is logged in
  const session = await auth();
  if (session?.user?.id) {
    // User is logged in, activate/extend license immediately
    try {
      await activateLicense(licenseKey, session.user.id);
      return {
        code: 200,
        success: true,
        message: 'License activated successfully.',
        url: '/dashboard', // Redirect to dashboard
      };
    } catch (error) {
      console.error('Failed to activate license for logged-in user:', error);
      return {
        code: 500,
        success: false,
        message: 'Failed to activate license. Please try again or contact support.',
      };
    }
  }

  const activationExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit
  const activationSignature = await generateLicenseSignature(
    email,
    'activation-pass',
    licenseKey,
    activationExpiresAt,
  );
  return {
    code: 200,
    success: true,
    message: 'OTP verified successfully.',
    data: activationSignature,
    url: `/signup?signature=${encodeURIComponent(activationSignature)}`,
  };
}

export async function resendOtpAction(
  currentSignature: string,
): Promise<ResponseAction<{ newSignature: string }>> {
  if (!currentSignature)
    return {
      code: 400,
      success: false,
      message: 'Missing signature. Please start over.',
    };

  const verificationResult = await verifyLicenseSignature(currentSignature);
  if (!verificationResult.valid || !verificationResult.payload) {
    return {
      code: 400,
      success: false,
      message: 'Invalid signature. Please start over.',
    };
  }

  const { email, licenseKey } = verificationResult.payload;
  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  console.log(`[DEV ONLY] NEW OTP for ${email} is: ${newOtp}`);
  await redis.set(getOtpKey(licenseKey), newOtp, 'EX', 600);
  const newSignature = await generateLicenseSignature(
    email,
    newOtp,
    licenseKey,
    newExpiresAt,
  );
  return {
    code: 200,
    success: true,
    message: 'A new OTP has been sent.',
    data: { newSignature },
  };
}
