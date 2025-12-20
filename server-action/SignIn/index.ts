'use server';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { db } from '@/libs/drizzle';
import { users } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { signIn } from '@/libs/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

const credentialsSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = credentialsSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!validatedFields.success) {
    return 'Invalid credentials. Please check your email and password.';
  }

  const { email, password } = validatedFields.data;
  let redirectUrl = '/coba'; // Default URL

  // --- 1. Pre-Check: Validasi License & Tentukan Role URL ---
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        licenses: true,
      },
    });

    if (!user) {
      // Biarkan lanjut ke signIn agar error credentials yang menangani (keamanan)
      // atau return 'User not found'
    } else {
      // Tentukan Redirect URL berdasarkan Role
      if (user.roleUser === 'superadmin' || user.roleUser === 'admin') {
        redirectUrl = '/dashboard';
      } else {
        redirectUrl = '/coba';
      }

      // Logic License Check (Hanya untuk user biasa)
      if (user.roleUser === 'user') {
        const activeLicense = user.licenses.find((l) => l.status === 'active');
        if (!activeLicense) {
          return 'No active license found. Please verify your license.';
        }
        if (activeLicense.planType === 'subscribe' && activeLicense.expiresAt) {
          const now = new Date();
          const expiresAt = new Date(activeLicense.expiresAt);
          if (now > expiresAt) {
            return 'License expired. Please renew your license.';
          }
        }
      }
    }
  } catch (err) {
    console.error('Error pre-checking user:', err);
    return 'System error during validation.';
  }

  // --- 2. Eksekusi Login ---
  try {
    // Kita pass redirectUrl dinamis di sini
    await signIn('credentials', {
      email,
      password,
      redirectTo: redirectUrl,
    });
  } catch (error) {
    // PENTING: Cek apakah error ini adalah sinyal Redirect dari Next.js
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials. Please try again.';
        case 'CallbackRouteError':
          return 'Authentication failed. Check license or system error.';
        default:
          return 'Something went wrong.';
      }
    }

    throw error;
  }
}

// Google Sign In
export async function googleSignIn() {
  try {
    // Google default redirect ke root, nanti middleware yang arahkan ke dashboard yang benar
    // atau gunakan callback redirect di auth.ts (tapi cara di bawah ini paling aman)
    await signIn('google', { redirectTo: '/coba' });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw error;
  }
}
