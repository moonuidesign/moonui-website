'use server';
import { users } from '@/db/migration';
import { db } from '@/libs/drizzle';
import { sendPasswordResetEmail } from '@/libs/mail';
import redis from '@/libs/redis-local';
import { generateResetPasswordSignature } from '@/libs/signature';
import { generateOTP } from '@/libs/utils';
import { ResponseAction } from '@/types/response-action';
import { eq } from 'drizzle-orm';
import z from 'zod';

const sendOTPForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});
type SendOTPForgotPasswordSchema = z.infer<typeof sendOTPForgotPasswordSchema>;
const getPasswordResetOtpKey = (email: string) => `password-reset-otp:${email}`;
export async function sendOTPForgotPassword(
  data: SendOTPForgotPasswordSchema,
): Promise<ResponseAction<null>> {
  const result = sendOTPForgotPasswordSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return { code: 400, success: false, message: errors };
  }
  const { email } = result.data;
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return { code: 404, success: false, message: 'User not found.' };
    }

    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 menit
    const redisKey = getPasswordResetOtpKey(email);

    // Simpan OTP ke Redis selama 10 menit
    await redis.set(redisKey, otp, 'EX', 600);

    const signature = await generateResetPasswordSignature(
      email,
      otp,
      expiryTime,
    );
    const resetUrl = `/forgot-password/otp?signature=${encodeURIComponent(
      signature,
    )}`;

    await sendPasswordResetEmail(email, otp, resetUrl);
    console.log(`[DEV ONLY] Password reset OTP for ${email} is: ${otp}`);

    return {
      code: 200,
      success: true,
      message: 'A verification code has been sent to your email.',
      data: null,
      url: resetUrl,
    };
  } catch (error) {
    console.error('Error sending verification code:', error);
    return {
      code: 500,
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
