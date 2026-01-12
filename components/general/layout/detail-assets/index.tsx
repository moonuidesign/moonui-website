'use client';
import React, { Suspense } from 'react';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useFilter } from '@/contexts';
import { SkeletonNavbar } from '../main';
import Navbar from '../main/navbar';

export default function DetailAssetsLayout({ children }: { children: React.ReactNode }) {
  const { isFilterOpen, setFilterOpen } = useFilter();

  return (
    <div className="min-h-screen">
      <motion.div
        animate={
          isFilterOpen
            ? { scale: 0.92, borderRadius: '24px', opacity: 0.8 }
            : { scale: 1, borderRadius: '0px', opacity: 1 }
        }
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        onClick={() => isFilterOpen && setFilterOpen(false)}
        className={`min-h-screen w-full origin-top bg-[#E7E7E7] ${
          isFilterOpen ? 'pointer-events-none cursor-pointer' : ''
        }`}
      >
        <div className="relative z-[100] h-fit w-full md:p-2">
          <div className="flex w-full items-center justify-center gap-2 bg-black px-4 pt-4 pb-20 text-[#B8B8B8] md:mb-10 md:rounded-lg md:py-3">
            {/* Icon tetap sebagai flex item pertama */}
            <Image
              alt="Rocket"
              src="/Vector.svg"
              width={100}
              height={100}
              className="size-4 shrink-0 md:size-4" // shrink-0 agar icon tidak gepeng
            />

            {/* Gabungkan SEMUA teks dalam satu tag <p> atau <div> */}
            <p className="text-sm">
              Build your business faster with <span className="font-medium text-white">MoonUI</span>{' '}
              premium design assets!{' '}
              {/* Gunakan span/link untuk Learn more di SINI, bukan dipisah */}
              <span className="cursor-pointer font-medium text-white underline transition-colors hover:text-gray-200">
                Learn more
              </span>
            </p>
          </div>
        </div>
        <div className="relative z-[800] -mt-[69px] h-fit overflow-hidden rounded-t-[39px] bg-[#E7E7E7] md:z-[200] md:-mt-[48px] md:overflow-visible md:rounded-none md:bg-none">
          <Suspense
            fallback={
              <section className="relative z-[1000] h-24">
                {/* Fixed Container matching 'fixed top-10 ...' */}
                <div className="pointer-events-none fixed top-10 right-0 left-0 z-[60] flex justify-center pt-6">
                  {/* Nav Container matching dimensions and grid layout */}
                  {/* Menggunakan max-w sesuai initial state framer-motion: Desktop 80rem, Tablet 64rem */}
                  <div className="pointer-events-auto relative mx-auto grid h-16 w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-4 md:h-20 md:max-w-[64rem] md:grid-cols-[1fr_auto_1fr] md:px-3 lg:max-w-[80rem]">
                    {/* Background mimicking the 'bg-white/80' pill */}
                    <div className="absolute inset-0 -z-10 rounded-full border border-gray-200/60 bg-white/80 shadow-sm backdrop-blur-md md:mx-0" />

                    {/* --- 1. LEFT: LOGO --- */}
                    <div className="flex w-full items-center justify-start">
                      {/* Logo Placeholder */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center p-1.5">
                        <SkeletonNavbar className="h-full w-full rounded-sm bg-zinc-300" />
                      </div>

                      {/* Mobile Search Button Placeholder (md:hidden) */}
                      <SkeletonNavbar className="ml-3 h-9 w-9 rounded-full md:hidden" />
                    </div>

                    {/* --- 2. CENTER: MENU & SEARCH (hidden md:flex) --- */}
                    <div className="relative hidden items-center justify-center gap-4 px-4 py-4 md:flex">
                      {/* Menu Items */}
                      <div className="flex w-full items-center justify-center gap-4 lg:gap-6">
                        {/* Mimic 4 menu items */}
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-2">
                            {/* Icon placeholder (hidden lg:block logic mimicking original text) */}
                            <SkeletonNavbar className="h-4 w-16 bg-zinc-300/70" />
                          </div>
                        ))}
                      </div>

                      {/* Search Input Placeholder */}
                      <div className="ml-2 hidden md:block lg:ml-4">
                        <SkeletonNavbar className="h-9 w-48 rounded-full lg:w-64" />
                      </div>
                    </div>

                    {/* --- 3. RIGHT: ACTIONS --- */}
                    <div className="flex w-full items-center justify-end gap-2 md:gap-4">
                      {/* Profile Section */}
                      <div className="relative">
                        <div className="flex items-center gap-3 rounded-full border border-transparent p-1">
                          {/* Avatar Circle */}
                          <SkeletonNavbar className="h-8 w-8 shrink-0 rounded-full md:h-9 md:w-9" />

                          {/* Text Details (Hidden on Tablet, Visible on XL) */}
                          <div className="mr-2 hidden space-y-1 text-left xl:block">
                            <SkeletonNavbar className="h-3 w-24 bg-zinc-300" />
                            <SkeletonNavbar className="h-2 w-12" />
                          </div>
                        </div>
                      </div>

                      {/* Mobile Menu Toggle Button (md:hidden) */}
                      <SkeletonNavbar className="h-9 w-9 rounded-full md:hidden" />
                    </div>
                  </div>
                </div>
              </section>
            }
          >
            <Navbar />
          </Suspense>
          <main id="main-content">{children}</main>
        </div>
      </motion.div>
    </div>
  );
}
