'use server';

import { users } from '@/db/migration/schema';
import { db, getUserFromDb } from '@/libs/db';
import { sendVerificationEmail } from '@/libs/mail';
import { generateOTP } from '@/libs/utils';
import { ResponseAction } from '@/types/response-action';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Definisikan skema Zod secara statis di sini
const sendOTPSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

// Tipe TypeScript yang diinferensikan dari skema Zod
type SendOTPSchema = z.infer<typeof sendOTPSchema>;

export async function sendOTPEmail(
  data: SendOTPSchema,
): Promise<ResponseAction<null>> {
  // Validasi data input menggunakan skema statis
  const result = sendOTPSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return {
      code: 400,
      success: false,
      message: errors,
    };
  }

  try {
    const user = await getUserFromDb(result.data.email);
    if (!user) {
      return {
        code: 404,
        success: false,
        message: 'User not found.', // Pesan statis
      };
    }

    if (user.emailVerified) {
      return {
        code: 409,
        success: false,
        message: 'This email has already been verified.', // Pesan statis
      };
    }

    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 menit dari sekarang

    await db
      .update(users)
      .set({
        verificationToken: otp,
        verificationExpiry: expiryTime,
      })
      .where(eq(users.id, user.id));

    await sendVerificationEmail(result.data.email, otp);

    return {
      code: 200,
      success: true,
      message: 'A new verification code has been sent to your email.', // Pesan statis
      data: null,
      url: '',
    };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    if (error instanceof Error) {
      return {
        code: 500,
        success: false,
        message: 'Failed to send the verification code. Please try again.', // Pesan statis
      };
    }
    return {
      code: 500,
      success: false,
      message: 'An unexpected error occurred. Please try again.', // Pesan statis
    };
  }
}
