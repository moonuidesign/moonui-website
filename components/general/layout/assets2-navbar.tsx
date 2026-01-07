'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, LayoutDashboard, User, Settings, LogOut } from 'lucide-react';
import { useFilter } from '@/contexts';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { SkeletonNavbar } from './main';
import { AnimatePresence, motion } from 'framer-motion';

export default function Assets2Navbar() {
  const { data: session, status } = useSession();
  const { searchQuery, setSearchQuery } = useFilter();
  const isSessionLoading = status === 'loading';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <Link href="/" className="flex items-center justify-center">
        <span className="group relative z-20 flex h-[45px] w-[45px] shrink-0 cursor-pointer items-center justify-center rounded-full outline-none select-none focus:ring-0 focus:outline-none">
          <Image
            src="/logo.svg"
            alt="MoonUI"
            width={45}
            height={45}
            className="h-[45px] w-[45px] transition-all duration-300"
          />
        </span>
        <span className="relative z-10 ml-2 hidden items-center overflow-hidden whitespace-nowrap md:flex">
          <Image
            src="/logo-moonui.svg"
            alt="MoonUI"
            width={80}
            height={24}
            className="h-6 w-auto object-contain select-none"
          />
        </span>
      </Link>
      <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
        <div className="relative w-full max-w-[180px] sm:max-w-[220px] md:max-w-sm lg:max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-white py-2 pr-4 pl-9 text-sm transition-all outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 md:py-2.5 md:pl-10"
          />
        </div>
        {isSessionLoading ? (
          <div className="hidden items-center gap-3 md:flex">
            <SkeletonNavbar className="h-9 w-9 rounded-full md:h-10 md:w-10" />
          </div>
        ) : session?.user ? (
          <div className="relative z-50" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="group flex cursor-pointer items-center gap-3 rounded-full border bg-[#1B1B1B] p-1 transition-all"
            >
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-200 md:h-9 md:w-9">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt="User"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-orange-600 text-xs font-bold text-white md:text-sm">
                    {session.user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="hidden text-left xl:mr-2 xl:block">
                <p className="text-sm font-medium text-[#D3D3D3] transition-colors group-hover:text-white">
                  {session.user.name}
                </p>
                <p className="text-[10px] text-gray-300 transition-colors group-hover:text-white">
                  Pro Plan
                </p>
              </div>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, type: 'spring' }}
                  className="absolute top-full right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl"
                >
                  <div className="mb-1 border-b border-gray-100 px-3 py-2">
                    <p className="text-xs font-medium text-gray-500">Signed in as</p>
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {session.user.email}
                    </p>
                  </div>

                  {(session.user.roleUser === 'admin' ||
                    session.user.roleUser === 'superadmin') && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>

                  <div className="my-1 h-px bg-gray-100" />

                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/signin"
              className="flex h-8 shrink-0 items-center rounded-full border border-[#D3D3D3] bg-white px-3 py-1.5 text-sm font-medium whitespace-nowrap text-neutral-600 shadow-sm transition-colors hover:bg-[#FF4F00] hover:text-white md:h-9 md:px-4 md:py-2 md:text-sm"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="hidden h-9 shrink-0 items-center gap-2 rounded-full bg-[#1B1B1B] px-4 py-2 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-colors hover:bg-[#FF4F00] lg:flex"
            >
              <Image src="/ic-diamond-small.svg" width={15} height={15} alt="arrow-right" />
              Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
