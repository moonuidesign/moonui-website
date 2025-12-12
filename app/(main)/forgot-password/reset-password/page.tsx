import ResetPasswordForm from '@/components/reset-password';
import Image from 'next/image';
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
    <div className="dark:bg-black mb-0 lg:mb-20 h-[80vh] dark:bg-dot-white">
      <div className="md:grid-cols-2 lg:grid-cols-2 w-full md:grid lg:grid py-20 flex container mx-auto">
        <div className="col-span-1 justify-center items-center hidden h-full w-full lg:flex md:flex">
          <Image
            alt="otp"
            width={100}
            height={100}
            src="/otp.svg"
            className="w-[80%] h-full"
            priority // Tambahkan priority karena ini LCP (Largest Contentful Paint) di layout ini
          />
        </div>

        {/* Kolom form */}
        <div className="w-full col-span-1 backdrop-blur-xs bg-opacity-40 rounded-xl p-5 md:px-0 lg:px-24 md:py-0 lg:py-10">
          {/* 
            Bungkus HANYA komponen yang menggunakan useSearchParams dengan Suspense.
            Layout di sekitarnya akan dirender terlebih dahulu.
          */}
          <Suspense fallback={<FormSkeleton />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
