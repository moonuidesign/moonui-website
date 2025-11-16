// serverAction/auth/register.ts

'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { users } from '@/db/migration/schema';

import { verifyLicenseSignature } from '@/libs/signature';
import { RegisterSchema, RegisterSchemaType } from '@/types/register';
import { activateLicense } from '../Activate/activate';
import { signIn } from '@/libs/auth';
import { db } from '@/libs/drizzle';

const ACTIVATION_COOKIE = 'ls_activation_key';

export async function registerWithCredentials(values: RegisterSchemaType) {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { signature, email, name, password } = validatedFields.data;

  const verificationResult = await verifyLicenseSignature(signature);
  if (
    !verificationResult.valid ||
    verificationResult.expired ||
    verificationResult.payload?.email !== email
  ) {
    return { error: 'Invalid or expired signature.' };
  }

  const { licenseKey } = verificationResult.payload;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existingUser) {
    return { error: 'Email already in use!' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      name,
      password: hashedPassword,
      emailVerified: new Date(),
    })
    .returning({ id: users.id });

  try {
    await activateLicense(licenseKey, newUser.id, email);
  } catch (error) {
    console.error('LICENSE_ACTIVATION_FAILED', error);
    // Idealnya, hapus pengguna yang baru dibuat jika aktivasi gagal
    return {
      error: 'Failed to activate your license. Please contact support.',
    };
  }

  return { success: 'Registration successful! You can now log in.' };
}

export async function registerWithGoogle(formData: FormData) {
  const signature = formData.get('signature') as string;

  if (!signature) {
    throw new Error('Missing signature for Google sign-in.');
  }

  const verificationResult = await verifyLicenseSignature(signature);
  if (!verificationResult.valid || verificationResult.expired) {
    throw new Error('Invalid or expired signature for Google sign-in.');
  }

  const { licenseKey, email } = verificationResult.payload!;

  // Simpan licenseKey dan email di cookie aman sebelum redirect ke Google
  (await cookies()).set(
    ACTIVATION_COOKIE,
    JSON.stringify({ licenseKey, email }),
    {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // Cookie berlaku 5 menit
    },
  );

  await signIn('google', { redirectTo: '/dashboard' });
}
