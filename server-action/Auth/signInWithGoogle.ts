// server-action/Auth/signInWithGoogle.ts
// Server action untuk handle Google Sign-In (hanya untuk user yang sudah ada)

'use server';

import { cookies } from 'next/headers';
import { signIn } from '@/libs/auth';

// Cookie name untuk menandai mode signin-only
const SIGNIN_MODE_COOKIE = 'google_signin_mode';


export async function signInWithGoogle() {
    (await cookies()).set(SIGNIN_MODE_COOKIE, 'signin_only', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 5,
        sameSite: 'lax',
    });

    await signIn('google', { redirectTo: '/' });
}
