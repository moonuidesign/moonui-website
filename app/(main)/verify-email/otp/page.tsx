import VerifyEmailOTPForm from '@/components/otp-verify-email';
import { Suspense } from 'react';

function FormSkeleton() {
  return (
    <div className="w-full max-w-md h-auto p-5 flex flex-col justify-center items-center mx-auto animate-pulse">
      <div className="w-full text-center space-y-3 mb-8">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mx-auto"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mt-2"></div>
      </div>
      <div className="w-full space-y-6">
        <div className="flex justify-center gap-2">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md"
            ></div>
          ))}
        </div>
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-md w-full mt-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mt-2"></div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="bg-[#E8E8E8] h-screen">
      <div className="dark:bg-black w-screen container mx-auto h-screen max-w-[1440px] max-h-[1024px] flex justify-center items-center">
        <div className="w-full flex h-[80%] min-h-[650px] justify-center item-center backdrop-blur-xs bg-opacity-40 rounded-xl p-5 ">
          <Suspense fallback={<FormSkeleton />}>
            <VerifyEmailOTPForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
