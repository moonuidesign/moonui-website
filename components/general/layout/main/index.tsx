'use client';
import React, { Suspense } from 'react';
import Navbar from './navbar';
import Footer from './footer';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useFilter } from '@/contexts';
import { NavbarSkeleton } from '@/components/skeletons/navbar-skeleton';

export * from './footer';
export * from './navbar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isFilterOpen, setFilterOpen } = useFilter();

  return (
    <div className="min-h-screen overflow-x-hidden">
      <motion.div
        animate={
          isFilterOpen
            ? { scale: 0.92, borderRadius: '24px', opacity: 0.8 }
            : { scale: 1, borderRadius: '0px', opacity: 1 }
        }
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        onClick={() => isFilterOpen && setFilterOpen(false)}
        className={`min-h-screen w-full bg-[#E7E7E7] origin-top ${
          isFilterOpen ? 'cursor-pointer pointer-events-none' : ''
        }`}
      >
        <div className=" h-fit w-full md:p-2  ">
          <div className="flex items-center justify-center gap-2 w-full px-4   md:rounded-lg pb-20 md:py-3 pt-4 md:mb-10   bg-black  text-[#B8B8B8]">
            {/* Icon tetap sebagai flex item pertama */}
            <Image
              alt="Rocket"
              src="/Vector.svg"
              width={100}
              height={100}
              className="size-4 md:size-4 shrink-0" // shrink-0 agar icon tidak gepeng
            />

            {/* Gabungkan SEMUA teks dalam satu tag <p> atau <div> */}
            <p className="text-sm ">
              Built faster websites with{' '}
              <span className="text-white font-medium">MoonUI</span> components!{' '}
              {/* Gunakan span/link untuk Learn more di SINI, bukan dipisah */}
              <span className="text-white underline font-medium cursor-pointer hover:text-gray-200 transition-colors">
                Learn more
              </span>
            </p>
          </div>
        </div>
        <div className="rounded-t-2xl -mt-[100px] z-[10] md:rounded-0 md:m-0  overflow-hidden h-fit">
          <Suspense fallback={<NavbarSkeleton />}>
            <Navbar />
          </Suspense>
          {children}
          <Footer
            socials={{
              twitter: 'https://twitter.com/moonui',
              github: 'https://github.com/moonui',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
