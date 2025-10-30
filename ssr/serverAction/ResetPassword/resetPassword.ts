'use server';
import { users } from '@/db/migration/schema';
import { db } from '@/libs/db';
import { verifyResetPasswordSignature } from '@/libs/signature';
import { hashPassword } from '@/libs/utils';
import { ResponseAction } from '@/types/response-action';

import { eq } from 'drizzle-orm';
import * as z from 'zod';

// Definisikan skema Zod secara statis di sini
const actionResetPasswordSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' }),
    confirmPassword: z.string().min(8, {
      message: 'Confirm password must be at least 8 characters long.',
    }),
    signature: z.string().min(1, { message: 'Signature is required.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'], // path untuk menampilkan error pada field confirmPassword
  });

// Ekstrak tipe dari skema statis
type ActionResetPasswordSchema = z.infer<typeof actionResetPasswordSchema>;

export async function resetPassword(
  data: ActionResetPasswordSchema,
): Promise<ResponseAction<null>> {
  // Validasi input menggunakan skema Zod statis
  const result = actionResetPasswordSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return {
      code: 400,
      success: false,
      message: errors.join(', '), // Gabungkan pesan error
    };
  }

  // Verifikasi signature
  const { valid, expired } = await verifyResetPasswordSignature(
    result.data.signature,
  );

  if (!valid) {
    return {
      code: 400,
      success: false,
      message: 'The signature is not valid. Please start the process again.',
    };
  }
  if (valid && expired) {
    return {
      code: 400,
      success: false,
      message: 'Your password reset request has expired. Please try again.',
    };
  }

  try {
    // Cari pengguna berdasarkan email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, result.data.email));

    if (!user) {
      return {
        code: 404, // Menggunakan 404 Not Found lebih sesuai
        success: false,
        message: 'User with this email was not found.',
      };
    }

    const hashedPassword = await hashPassword(result.data.password);

    // Periksa apakah kata sandi baru sama dengan yang lama
    if (user.password && hashedPassword === user.password) {
      return {
        code: 409, // 409 Conflict
        success: false,
        message: 'The new password cannot be the same as the old password.',
      };
    }

    // Perbarui kata sandi pengguna
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null, // Hapus token setelah berhasil reset
        resetTokenExpiry: null,
      })
      .where(eq(users.email, result.data.email));

    return {
      code: 200,
      success: true,
      message: 'Your password has been changed successfully.',
      data: null,
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      code: 500,
      success: false,
      message: 'An unexpected error occurred while resetting your password.',
    };
  }
}
