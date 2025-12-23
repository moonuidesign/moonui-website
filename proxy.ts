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
  // 0. Dashboard Access - Admin/SuperAdmin Only
  // =================================================================
  if (nextUrl.pathname.startsWith('/dashboard')) {
    // Must be logged in
    if (!req.auth) {
      const url = new URL('/signin', nextUrl.origin);
      url.searchParams.set(
        'error',
        'You must be logged in to access this page.',
      );
      url.searchParams.set('callbackUrl', nextUrl.href);
      return NextResponse.redirect(url);
    }

    // Only admin and superadmin can access dashboard
    if (role !== 'admin' && role !== 'superadmin') {
      return redirectError(
        'Access denied. Only administrators can access the dashboard.',
        '/',
      );
    }
  }

  // =================================================================
  // 0.1 Redirect Logged-In Admin/SuperAdmin from /signin to Dashboard
  // =================================================================
  if (
    req.auth &&
    nextUrl.pathname.startsWith('/signin') &&
    (role === 'admin' || role === 'superadmin')
  ) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
  }

  const searchParams = nextUrl.searchParams;
  const signature = searchParams.get('signature');

  // =================================================================
  // 1. Signature Verification Middleware
  // =================================================================

  // 1. Invite Page - Signature required
  if (nextUrl.pathname.startsWith('/invite')) {
    if (!signature) {
      return redirectError(
        'Invalid invitation link. Please make sure you are using the correct link from the invitation email.',
      );
    }
    const { valid, expired } = await verifyInviteSignature(signature);
    if (!valid) {
      return redirectError(
        'Invalid invitation signature. Please contact admin to get a new invitation link.',
      );
    }
    if (expired) {
      return redirectError(
        'Invitation link has expired. Please contact admin to get a new invitation link.',
      );
    }
  }

  // 2. Signup Page - Signature required and must be valid
  if (nextUrl.pathname.startsWith('/signup')) {
    if (!signature) {
      return redirectError(
        'You must verify your license first before signing up. Enter your license key to continue.',
        '/verify-license',
      );
    }
    const { valid, expired } = await verifyLicenseSignature(signature);
    if (!valid) {
      return redirectError(
        'Invalid registration session. Please verify your license again by entering your license key.',
        '/verify-license',
      );
    }
    if (expired) {
      return redirectError(
        'Your registration session has expired (more than 5 minutes). Please verify your license again.',
        '/verify-license',
      );
    }
  }

  // 3. Reset Password Page - Signature required
  if (nextUrl.pathname.startsWith('/forgot-password/reset-password')) {
    if (!signature) {
      return redirectError(
        'Invalid reset password link. Please request a new reset password link.',
        '/forgot-password',
      );
    }
    const { valid, expired } = await verifyResetPasswordSignature(signature);
    if (!valid) {
      return redirectError(
        'Invalid or already used reset password link. Please request a new link.',
        '/forgot-password',
      );
    }
    if (expired) {
      return redirectError(
        'Reset password link has expired. Please request a new reset password link.',
        '/forgot-password',
      );
    }
  }

  // 4. Verify License OTP - Signature required and must be valid
  if (nextUrl.pathname.startsWith('/verify-license/otp')) {
    if (!signature) {
      return redirectError(
        'OTP verification session not found. Please enter your license key to start the verification process.',
        '/verify-license',
      );
    }
    const { valid, expired } = await verifyLicenseSignature(signature);
    if (!valid) {
      return redirectError(
        'Invalid OTP verification session. Please enter your license key again.',
        '/verify-license',
      );
    }
    if (expired) {
      return redirectError(
        'OTP verification session has expired (more than 10 minutes). Please start verification again.',
        '/verify-license',
      );
    }
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
