import React, { Suspense } from 'react';
import Assets2Navbar from '@/components/general/layout/assets2-navbar';
import MobileFilterWrapper from '../../../components/assets-v2/_components/mobile-filter-wrapper';

export default function Assets2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full font-['Inter']">
      <Suspense fallback={null}>
        <MobileFilterWrapper />
      </Suspense>
      <div className="relative z-50 mx-auto flex w-full flex-col gap-6 rounded-t-[39px] px-0 py-6 pt-4 md:z-0 md:mt-[30px] md:rounded-none md:bg-none md:px-6 md:pt-0 lg:px-8">
        <div className="w-full px-4 md:px-0">
          <Assets2Navbar />
        </div>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
