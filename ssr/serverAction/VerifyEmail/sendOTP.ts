'use server';

import { getUserFromDb } from '@/libs/db';
import { sendVerificationEmail } from '@/libs/mail';
import { generateOTP } from '@/libs/utils';
import { ResponseAction } from '@/types/response-action';
import { z } from 'zod';
import redis from '@/libs/redis-local';
const sendOTPSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});
type SendOTPSchema = z.infer<typeof sendOTPSchema>;
const getEmailVerificationOtpKey = (email: string) =>
  `email-verify-otp:${email}`;

/**
 * Mengirimkan OTP verifikasi email dan menyimpannya di Redis.
 */
export async function sendOTPEmail(
  data: SendOTPSchema,
): Promise<ResponseAction<null>> {
  const result = sendOTPSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return { code: 400, success: false, message: errors };
  }

  const { email } = result.data;

  try {
    const user = await getUserFromDb(email);
    if (!user) {
      return { code: 404, success: false, message: 'User not found.' };
    }
    if (user.emailVerified) {
      return {
        code: 409,
        success: false,
        message: 'This email has already been verified.',
      };
    }

    const otp = generateOTP();
    const redisKey = getEmailVerificationOtpKey(email);

    // Simpan OTP ke Redis dengan masa berlaku 10 menit (600 detik)
    await redis.set(redisKey, otp, 'EX', 600);

    await sendVerificationEmail(email, otp);
    console.log(`[DEV ONLY] Email verification OTP for ${email} is: ${otp}`);

    return {
      code: 200,
      success: true,
      message: 'A new verification code has been sent to your email.',
      data: null,
    };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return {
      code: 500,
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
