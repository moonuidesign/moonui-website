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

  // --- Helper for info redirect with Toast message ---
  const redirectInfo = (msg: string, redirectTo = '/') => {
    const url = new URL(redirectTo, nextUrl.origin);
    url.searchParams.set('info', msg);
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
        'Silakan login terlebih dahulu untuk mengakses halaman ini.',
      );
      url.searchParams.set('callbackUrl', nextUrl.href);
      return NextResponse.redirect(url);
    }

    // Only admin and superadmin can access dashboard
    // Regular users are silently redirected to home (no error message needed)
    if (role !== 'admin' && role !== 'superadmin') {
      // Silent redirect - no error message because this is expected behavior
      return NextResponse.redirect(new URL('/', nextUrl.origin));
    }
  }

  // =================================================================
  // 0.1 Redirect Logged-In Users from /signin (already logged in)
  // =================================================================
  if (req.auth && nextUrl.pathname.startsWith('/signin')) {
    const userName = req.auth.user?.name || 'User';

    // Admin/SuperAdmin -> Dashboard
    if (role === 'admin' || role === 'superadmin') {
      return redirectInfo(
        'You are already signed in as admin. Redirecting to dashboard.',
        '/dashboard'
      );
    }

    // Regular user -> Homepage
    return redirectInfo(
      'You are already signed in. No need to sign in again.',
      '/'
    );
  }

  // =================================================================
  // 0.2 Block Logged-In Users from /forgot-password/* (already logged in)
  // =================================================================
  if (req.auth && nextUrl.pathname.startsWith('/forgot-password')) {
    return redirectInfo(
      'You are already signed in. To change your password, please go to account settings.',
      '/'
    );
  }

  // =================================================================
  // 0.3 Block Logged-In Users from /signup (already have account)
  // =================================================================
  if (req.auth && nextUrl.pathname.startsWith('/signup')) {
    return redirectInfo(
      'You already have an account.',
      '/'
    );
  }

  // =================================================================
  // 0.4 Verify License Access Control
  // - Guest (not logged in): Can access (for new registration)
  // - Logged-in user with expired/free tier: Can access (for license renewal)
  // - Logged-in user with active license (pro/pro_plus): Cannot access
  // - Admin/SuperAdmin: Cannot access
  // =================================================================
  if (nextUrl.pathname.startsWith('/verify-license')) {
    if (req.auth) {
      const tier = req.auth.user?.tier;
      const userName = req.auth.user?.name || 'User';

      // Admin/SuperAdmin cannot access
      if (role === 'admin' || role === 'superadmin') {
        return redirectInfo(
          'Admins do not need license verification.',
          '/dashboard'
        );
      }

      // User with active license (pro or pro_plus) cannot access
      if (tier === 'pro' || tier === 'pro_plus') {
        return redirectInfo(
          'Your license is still active. No need to verify again.',
          '/'
        );
      }

      // User with expired/free tier CAN access for renewal
      // Just continue to the page
    }
    // Guest (not logged in) can access for new registration
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

  // Note: verify-license access control is now handled in section 0.4 above

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
