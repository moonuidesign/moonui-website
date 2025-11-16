'use server';
import { users } from '@/db/migration/schema';
import { db } from '@/libs/db';
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

  if (!valid) {
    return {
      code: 400,
      success: false,
      message: 'The signature is not valid.',
    };
  }
  if (valid && expired) {
    return {
      code: 400,
      success: false,
      message: 'Your request has expired. Please try again.',
    };
  }

  // Periksa apakah OTP cocok
  if (result.data.otp !== payload?.otp) {
    return {
      code: 400,
      success: false,
      message: 'The OTP code is incorrect.',
    };
  }

  try {
    // Cari pengguna berdasarkan email dan token reset
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, payload.email),
          eq(users.resetToken, result.data.otp),
        ),
      );

    if (!user) {
      return {
        code: 409,
        success: false,
        message: 'User not found or the provided code is incorrect.',
      };
    }

    // Hapus token setelah berhasil diverifikasi
    await db
      .update(users)
      .set({
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(users.id, user.id));

    return {
      code: 200,
      success: true,
      message: 'OTP verified successfully.',
      data: null,
      url: result.data.signature, // Mengembalikan signature untuk langkah selanjutnya
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    // Penanganan error umum
    return {
      code: 500,
      success: false,
      message: 'An unexpected error occurred while verifying the OTP.',
    };
  }
}
