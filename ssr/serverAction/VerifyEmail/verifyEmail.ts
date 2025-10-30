'use server';
import { users } from '@/db/migration/schema';
import { unstable_update } from '@/libs/auth';
import { db } from '@/libs/db';
import { ResponseAction } from '@/types/response-action';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';

// Definisikan skema Zod secara statis di sini
const verifyEmailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  otp: z
    .string()
    .min(6, { message: 'Your verification code must be 6 characters.' }),
});

// Ekstrak tipe dari skema
type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;

export async function verifyEmail(
  data: VerifyEmailSchema,
): Promise<ResponseAction<null>> {
  // Validasi input menggunakan skema Zod statis
  const result = verifyEmailSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return {
      code: 400,
      success: false,
      message: errors.join(', '), // Gabungkan pesan error
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
        code: 404,
        success: false,
        message: 'User not found.',
      };
    }

    // Periksa apakah token verifikasi telah kedaluwarsa
    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      return {
        code: 400,
        success: false,
        message: 'The verification code has expired. Please request a new one.',
      };
    }

    // Periksa apakah token verifikasi cocok
    if (user.verificationToken !== result.data.otp) {
      return {
        code: 400,
        success: false,
        message: 'The verification code is invalid.',
      };
    }

    const newEmailVerifiedDate = new Date();

    // Perbarui status verifikasi email pengguna di database
    await db
      .update(users)
      .set({
        emailVerified: newEmailVerifiedDate,
        verificationToken: null,
        verificationExpiry: null,
      })
      .where(eq(users.id, user.id));

    // Revalidasi cache untuk path yang relevan
    revalidatePath('/verify-email/otp');
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/monitoring');
    revalidatePath('/dashboard/limitations');

    // Coba perbarui sesi NextAuth
    try {
      await unstable_update({
        user: {
          emailVerified: newEmailVerifiedDate,
        },
      });
      console.log(
        'NextAuth session update triggered for emailVerified (using unstable_update).',
      );
    } catch (sessionUpdateError) {
      console.error(
        'Failed to update NextAuth session after email verification:',
        sessionUpdateError,
      );
      // Kegagalan update sesi tidak seharusnya menghentikan respons sukses utama
    }

    return {
      code: 200,
      success: true,
      message: 'Your email has been verified successfully.',
      data: null,
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    return {
      code: 500,
      success: false,
      message: 'An unexpected error occurred while verifying your email.',
    };
  }
}
