'use server';
import { users } from '@/db/migration/schema';
import { db } from '@/libs/drizzle';

import { verifyResetPasswordSignature } from '@/libs/signature';
import { ResponseAction } from '@/types/response-action';

import { and, eq } from 'drizzle-orm';
import * as z from 'zod';

// Definisikan skema Zod secara statis di sini
const actionVerificationOTPSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 characters.' }),
  signature: z.string().min(1, { message: 'Signature is required.' }),
});

// Ekstrak tipe dari skema statis
type ActionVerificationOTPSchema = z.infer<typeof actionVerificationOTPSchema>;

export async function verifyOTPForgotPassword(
  data: ActionVerificationOTPSchema,
): Promise<ResponseAction<null>> {
  // Validasi input menggunakan skema Zod statis
  const result = actionVerificationOTPSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);

    return {
      code: 400,
      success: false,
      message: errors.join(', '), // Gabungkan error menjadi satu string
    };
  }

  // Verifikasi signature
  const { payload, valid, expired } = await verifyResetPasswordSignature(
    result.data.signature,
  );

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, payload.email),
          eq(users.resetToken, result.data.otp),
        ),
      );
  } catch (error) {}
}
