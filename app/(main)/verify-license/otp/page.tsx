'use client';

import { useSession } from 'next-auth/react';
import { VerifyLicenseOTPForm } from '@/components/otp-validate';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { FormSkeleton } from '@/components/skeletons/form-skeleton';

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If loading, show loader
  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#E8E8E8] dark:bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-[#E8E8E8] h-screen">
      <div className="dark:bg-black w-screen container mx-auto h-screen max-w-[1440px] max-h-[1024px] flex justify-center items-center">
        <div className="w-full flex h-[80%] min-h-[650px] justify-center item-center backdrop-blur-xs bg-opacity-40 rounded-xl p-5 ">
          <Suspense fallback={<FormSkeleton />}>
            <VerifyLicenseOTPForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
