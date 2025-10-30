'use server';

import { users } from '@/db/migration/schema';
import { db } from '@/libs/db';
import { sendPasswordResetEmail } from '@/libs/mail';
import { generateResetPasswordSignature } from '@/libs/signature';
import { generateOTP } from '@/libs/utils';
import { ResponseAction } from '@/types/response-action';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Definisikan skema Zod secara statis di sini
const sendOTPForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

// Tipe TypeScript yang diinferensikan dari skema Zod
type SendOTPForgotPasswordSchema = z.infer<typeof sendOTPForgotPasswordSchema>;

export async function sendOTPForgotPassword(
  data: SendOTPForgotPasswordSchema,
): Promise<ResponseAction<null>> {
  // Validasi data input menggunakan skema statis
  const result = sendOTPForgotPasswordSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);

    return {
      code: 400,
      success: false,
      message: errors,
    };
  }
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, result.data.email));
    if (!user) {
      // Menggunakan pesan error statis
      return { code: 404, success: false, message: 'User not found.' };
    }

    const otp = await generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 menit dari sekarang

    const signature = await generateResetPasswordSignature(
      data.email,
      otp,
      expiryTime,
    );

    const resetUrl = `/forgot-password/otp?signature=${encodeURIComponent(
      signature,
    )}`;

    await db
      .update(users)
      .set({
        resetToken: otp,
        resetTokenExpiry: expiryTime,
      })
      .where(eq(users.id, user.id));

    await sendPasswordResetEmail(result.data.email, otp, resetUrl);

    return {
      code: 200,
      success: true,
      // Menggunakan pesan sukses statis
      message: 'A verification code has been sent to your email.',
      data: null,
      url: resetUrl,
    };
  } catch (error) {
    console.error('Error sending verification code:', error);
    if (error instanceof Error) {
      return {
        code: 500,
        success: false,
        // Menggunakan pesan error statis
        message: 'Failed to send the verification code. Please try again.',
      };
    }
    return {
      code: 500,
      success: false,
      // Menggunakan pesan error statis
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
