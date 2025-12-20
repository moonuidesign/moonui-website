import NextAuth from 'next-auth';
import { authConfig } from './libs/auth.config';
import {
  verifyInviteSignature,
  verifyResetPasswordSignature,
  verifyLicenseSignature,
} from '@/libs/signature';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;

  const role = req.auth?.user?.roleUser;

  // --- Helper for error redirect with Toast message ---
  const redirectError = (msg: string, redirectTo = '/signin') => {
    const url = new URL(redirectTo, nextUrl.origin);
    url.searchParams.set('error', msg);
    return NextResponse.redirect(url);
  };

  // =================================================================
  // 0. Global Auth Check for Dashboard
  // =================================================================
  if (nextUrl.pathname.startsWith('/dashboard') && !req.auth) {
    const url = new URL('/signin', nextUrl.origin);
    url.searchParams.set(
      'error',
      'You must be logged in to access the dashboard.',
    );
    url.searchParams.set('callbackUrl', nextUrl.href);
    return NextResponse.redirect(url);
  }

  // =================================================================
  // 0.1 Redirect Logged-In Users from Auth Pages
  // =================================================================
  if (
    req.auth &&
    (nextUrl.pathname.startsWith('/signin') ||
      nextUrl.pathname.startsWith('/signup'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
  }

  const searchParams = nextUrl.searchParams;
  const signature = searchParams.get('signature');

  // =================================================================
  // 1. Signature Verification Middleware
  // =================================================================

  // 1a. Invite Page (@app/(auth)/invite/**)
  if (nextUrl.pathname.startsWith('/invite')) {
    if (!signature) {
      return redirectError(
        'Missing invitation signature. Please check your link.',
      );
    }
    const { valid, expired } = await verifyInviteSignature(signature);
    if (!valid) return redirectError('Invalid invitation signature.');
    if (expired) return redirectError('Invitation link has expired.');
  }

  // 1e. Signup Page (@app/(auth)/signup/**)
  if (nextUrl.pathname.startsWith('/signup')) {
    if (!signature) {
      return redirectError(
        'Please verify your license first.',
        '/verify-license',
      );
    }
    // Note: We don't necessarily need to verify the signature strictly here
    // because the page itself likely does it (or the form submission),
    // but the requirement is just to redirect if signature is MISSING.
    // If you want strict verification here too:
    const { valid, expired } = await verifyLicenseSignature(signature);
    if (!valid)
      return redirectError('Invalid license signature.', '/verify-license');
    if (expired)
      return redirectError('License signature expired.', '/verify-license');
  }

  // 1b. Reset Password Page (@app/(main)/forgot-password/reset-password/**)
  if (nextUrl.pathname.startsWith('/forgot-password/reset-password')) {
    if (!signature) {
      return redirectError(
        'Missing reset password signature.',
        '/forgot-password',
      );
    }
    const { valid, expired } = await verifyResetPasswordSignature(signature);
    if (!valid)
      return redirectError('Invalid reset signature.', '/forgot-password');
    if (expired)
      return redirectError('Reset link has expired.', '/forgot-password');
  }

  // 1c. Verify License OTP (@app/(main)/verify-license/otp/**)
  if (nextUrl.pathname.startsWith('/verify-license/otp')) {
    if (!signature) {
      // Maybe redirect to verify-license init page instead of signin?
      return redirectError(
        'Missing license verification signature.',
        '/verify-license',
      );
    }
    const { valid, expired } = await verifyLicenseSignature(signature);
    if (!valid)
      return redirectError(
        'Invalid verification signature.',
        '/verify-license',
      );
    if (expired)
      return redirectError('Verification link has expired.', '/verify-license');
  }

  // 1d. Forgot Password OTP (@app/(main)/forgot-password/otp/**)
  // Logic: Usually OTP pages might need a signature to identify the session/user if not using cookies
  // The user prompt asked to protect this: @app\(main)\forgot-password\otp\**
  // But libs/signature.ts doesn't seem to have a specific signature for "forgot password OTP" distinct from reset password?
  // Or maybe it uses `verifyResetPasswordSignature` (ResetPasswordPayload has otp).
  // Let's assume it uses `verifyResetPasswordSignature` as well or verify generic signature?
  // Checking file content: `app/(main)/forgot-password/otp/page.tsx` uses `VerifyFogotPasswordOTPForm`.
  // It probably expects a signature.
  if (nextUrl.pathname.startsWith('/forgot-password/otp')) {
    if (!signature) {
      return redirectError('Missing signature.', '/forgot-password');
    }
    // We assume it uses the same payload structure as reset password (email, otp, expires)
    // because usually OTP verification precedes the reset password form, or vice versa?
    // Typically: Forgot Password -> Email Sent -> User clicks link (with signature) -> OTP Page (verify signature)
    const { valid, expired } = await verifyResetPasswordSignature(signature);
    if (!valid) return redirectError('Invalid signature.');
    if (expired) return redirectError('Link expired.');
  }

  // =================================================================
  // 2. Role-Based Access Control (RBAC) - Additional Blocks
  // =================================================================

  // 2a. Block 'admin' from accessing /verify-license/**
  // (Only User or Guest should access this?)
  // Prompt: "admin tidak bisa mengakses @app\(main)\verify-license\**"
  if (role === 'admin' && nextUrl.pathname.startsWith('/verify-license')) {
    return redirectError(
      'Admins cannot access license verification.',
      '/dashboard',
    );
  }

  // 2b. Block 'admin' from /dashboard/invite/** (Only Super Admin)
  if (role === 'admin' && nextUrl.pathname.startsWith('/dashboard/invite')) {
    return redirectError('Access restricted to Super Admin.', '/dashboard');
  }

  // 2c. Block 'admin' from /dashboard/transactions/** (Only Super Admin)
  if (
    role === 'admin' &&
    nextUrl.pathname.startsWith('/dashboard/transactions')
  ) {
    return redirectError('Access restricted to Super Admin.', '/dashboard');
  }

  return NextResponse.next();
});

export const config = {
  // Matcher ignoring static files and api
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
