import { Suspense } from 'react';
import VerifyFogotPasswordOTPForm from '@/components/otp-reset-password';
import { OTPSkeleton } from '@/components/otp-skeleton';

export default function Page() {
  return (
    <div className="bg-[#E8E8E8] h-screen">
      <div className="dark:bg-black w-screen container mx-auto h-screen max-w-[1440px] max-h-[1024px] flex justify-center items-center">
        <div className="w-full flex h-[80%] min-h-[650px] justify-center item-center backdrop-blur-xs bg-opacity-40 rounded-xl p-5 ">
          <Suspense fallback={<OTPSkeleton />}>
            <VerifyFogotPasswordOTPForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
