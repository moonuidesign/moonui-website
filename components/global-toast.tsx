'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Map NextAuth error codes to user-friendly messages
const errorMessages: Record<string, { message: string; redirect?: string }> = {
  'OAuthAccountNotLinked': {
    message: 'This email is already registered with a different sign-in method. Please use your original sign-in method or register with a license key.',
    redirect: '/verify-license',
  },
  'AccessDenied': {
    message: 'Access denied. Please check your credentials.',
  },
  'Configuration': {
    message: 'There is a problem with the server configuration.',
  },
  'Verification': {
    message: 'The verification link has expired or has already been used.',
  },
  'Default': {
    message: 'An authentication error occurred. Please try again.',
  },
};

export default function GlobalToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    const info = searchParams.get('info');

    if (error) {
      // Check if it's a known NextAuth error code
      const errorConfig = errorMessages[error] || null;

      if (errorConfig) {
        toast.error(errorConfig.message);
        if (errorConfig.redirect) {
          router.push(errorConfig.redirect);
          return;
        }
      } else {
        // Decode and show custom error message
        toast.error(decodeURIComponent(error));
      }

      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('error');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
    }

    if (success) {
      toast.success(decodeURIComponent(success));
      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('success');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
    }

    if (info) {
      toast.info(decodeURIComponent(info));
      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('info');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
    }
  }, [searchParams, pathname, router]);

  return <ToastContainer position="top-right" autoClose={5000} />;
}
