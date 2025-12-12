'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function GlobalToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');

    if (error) {
      toast.error(decodeURIComponent(error));
      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('error');
      router.replace(`${pathname}?${params.toString()}`);
    }

    if (success) {
      toast.success(decodeURIComponent(success));
      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('success');
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, pathname, router]);

  return <ToastContainer position="top-right" autoClose={5000} />;
}
