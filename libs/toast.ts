// components/common/ToastNotifier.tsx (buat file baru)

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export function ToastNotifier() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');

    if (error) {
      toast.error(error);
    }

    if (success) {
      toast.success(success);
    }
  }, [searchParams]);

  return null;
}
