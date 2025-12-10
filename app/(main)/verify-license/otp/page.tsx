'use client';

import { useSession } from 'next-auth/react';
import { VerifyLicenseOTPForm } from '@/components/OTPValidate';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

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

  // If user is NOT logged in, we assume they are verifying a NEW license for signup.
  // The current flow handles this via the signature -> signup page redirection.
  // But wait, VerifyLicenseOTPForm handles "Activate License". 
  
  // If user IS logged in:
  // We want to allow them to input a NEW license key to renew/extend.
  // The VerifyLicenseOTPForm should handle the "activateLicense" action which 
  // we updated previously to handle logged-in users (extending/updating).

  return (
    <div className="bg-[#E8E8E8] h-screen">
      <div className="dark:bg-black w-screen container mx-auto h-screen max-w-[1440px] max-h-[1024px] flex justify-center items-center">
        <div className="w-full flex h-[80%] min-h-[650px] justify-center item-center backdrop-blur-xs bg-opacity-40 rounded-xl p-5 ">
            <VerifyLicenseOTPForm />
        </div>
      </div>
    </div>
  );
}