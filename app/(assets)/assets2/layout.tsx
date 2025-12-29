import React, { Suspense } from 'react';
import Assets2Navbar from '@/components/general/layout/assets2-navbar';
import MobileFilterWrapper from './_components/mobile-filter-wrapper';

export default function Assets2Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-screen overflow-x-hidden min-h-screen font-['Inter'] relative">
            <Suspense fallback={null}>
                <MobileFilterWrapper />
            </Suspense>
            <div className="w-full h-full pt-14 md:pt-0 z-800 md:z-0  md:bg-none md:rounded-none rounded-t-[39px] -mt-[69px] md:mt-[30px] mx-auto px-4 md:px-6 lg:px-8 py-6 relative flex flex-col gap-6">
                <div className="w-full">
                     <Assets2Navbar />
                </div>
                <div className="w-full h-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
