'use client';
import React, { Suspense } from 'react';
import Navbar, { SkeletonNavbar } from './navbar';
import Footer from './footer';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useFilter } from '@/contexts';

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
        className={`min-h-screen w-full bg-[#E7E7E7] origin-top ${isFilterOpen ? 'cursor-pointer pointer-events-none' : ''
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
        <div className=" z-[800] md:z-0 bg-[#E7E7E7] md:bg-none md:rounded-none rounded-t-[39px] -mt-[69px] md:mt-0 relative  overflow-hidden h-fit">
          <Suspense
            fallback={
              <section className="h-24 relative z-[1000]">
                {/* Fixed Container matching 'fixed top-10 ...' */}
                <div className="fixed top-10 left-0 right-0 flex justify-center pt-6 pointer-events-none z-[60]">
                  {/* Nav Container matching dimensions and grid layout */}
                  {/* Menggunakan max-w sesuai initial state framer-motion: Desktop 80rem, Tablet 64rem */}
                  <div className="pointer-events-auto relative w-full h-16 md:h-20 px-4 md:px-3 grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-2 mx-auto md:max-w-[64rem] lg:max-w-[80rem]">
                    {/* Background mimicking the 'bg-white/80' pill */}
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-md shadow-sm border border-gray-200/60 rounded-full -z-10  md:mx-0" />

                    {/* --- 1. LEFT: LOGO --- */}
                    <div className="flex justify-start items-center w-full">
                      {/* Logo Placeholder */}
                      <div className="w-9 h-9 p-1.5 flex items-center justify-center shrink-0">
                        <SkeletonNavbar className="w-full h-full rounded-sm bg-zinc-300" />
                      </div>

                      {/* Mobile Search Button Placeholder (md:hidden) */}
                      <SkeletonNavbar className="md:hidden ml-3 w-9 h-9 rounded-full" />
                    </div>

                    {/* --- 2. CENTER: MENU & SEARCH (hidden md:flex) --- */}
                    <div className="hidden relative justify-center md:flex items-center gap-4 px-4 py-4">
                      {/* Menu Items */}
                      <div className="flex items-center gap-4 lg:gap-6 w-full justify-center">
                        {/* Mimic 4 menu items */}
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-2">
                            {/* Icon placeholder (hidden lg:block logic mimicking original text) */}
                            <SkeletonNavbar className="h-4 w-16 bg-zinc-300/70" />
                          </div>
                        ))}
                      </div>

                      {/* Search Input Placeholder */}
                      <div className="hidden md:block ml-2 lg:ml-4">
                        <SkeletonNavbar className="w-48 lg:w-64 h-9 rounded-full" />
                      </div>
                    </div>

                    {/* --- 3. RIGHT: ACTIONS --- */}
                    <div className="flex items-center justify-end w-full gap-2 md:gap-4">
                      {/* Profile Section */}
                      <div className="relative">
                        <div className="flex items-center gap-3 p-1 rounded-full border border-transparent">
                          {/* Avatar Circle */}
                          <SkeletonNavbar className="w-8 h-8 md:w-9 md:h-9 rounded-full shrink-0" />

                          {/* Text Details (Hidden on Tablet, Visible on XL) */}
                          <div className="text-left hidden xl:block mr-2 space-y-1">
                            <SkeletonNavbar className="h-3 w-24 bg-zinc-300" />
                            <SkeletonNavbar className="h-2 w-12" />
                          </div>
                        </div>
                      </div>

                      {/* Mobile Menu Toggle Button (md:hidden) */}
                      <SkeletonNavbar className="md:hidden w-9 h-9 rounded-full" />
                    </div>
                  </div>
                </div>
              </section>
            }
          >
            <Navbar />
          </Suspense>
          {children}
          <Footer
            socials={{
              x: 'https://x.com/moonui',
              instagram: 'https://instagram.com/moonui',
              linkedin: 'https://linkedin.com/company/moonui',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
