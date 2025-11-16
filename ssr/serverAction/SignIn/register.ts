'use server';

import { eq } from 'drizzle-orm';

import { ResponseAction } from '@/types/response-action';
import { registerSchema, RegisterSchema } from '@/types/register';
import { users } from '@/db/migration/schema';
import { db, generatePasswordHash } from '../../libs/db';
import { ZodIssue } from 'zod';

export async function signUp(
  data: RegisterSchema,
): Promise<ResponseAction<null>> {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((err: ZodIssue) => err.message);
    return {
      code: 400,
      success: false,
      message: errors,
    };
  }

  // 2. Cek apakah email sudah ada - Diubah ke Drizzle
  try {
    // Menggunakan API relasional Drizzle yang lebih modern dan bersih
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, result.data.email),
    });

    if (existingUser) {
      return {
        code: 400,
        success: false,
        message: 'This email is already registered.',
      };
    }

    const hashed = await generatePasswordHash(result.data.password);

    const [newUser] = await db
      .insert(users)
      .values({
        name: result.data.name,
        email: result.data.email,
        password: hashed,
      })
      .returning({ id: users.id }); // Hanya mengambil kembali ID yang baru dibuat

    // Jika terjadi error saat insert, blok catch akan menangkapnya.
    if (!newUser) {
      throw new Error('Failed to create user.');
    }

    return {
      code: 200,
      success: true,
      message: 'Registration successful!',
      data: null,
    };
  } catch (error: unknown) {
    console.error('Sign up error:', error);
    return {
      code: 500,
      success: false,
      message: 'An internal server error occurred. Please try again later.',
    };
  }
}
