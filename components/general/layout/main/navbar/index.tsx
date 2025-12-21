/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion';
import { Search, Menu, X, LayoutTemplate, Contact } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchCommand } from './search-command';
import { useSession } from 'next-auth/react';
import { GoProCard } from '@/components/assets/sidebar';
import { Note } from 'iconsax-reactjs';
import Image from 'next/image';

export * from './search-command';

// --- DATA MENU ITEM ---
const MENU_ITEMS = [
  {
    label: 'Assets',
    href: '/assets',
    icon: LayoutTemplate,
    isPro: false,
    isExternal: true,
  },
  {
    label: 'About Us',
    href: '/about',
    icon: Note,
    isPro: false,
    isExternal: true,
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: Contact,
    isPro: false,
    isExternal: true,
  },
  {
    label: 'Pricing',
    href: '/pricing',
    icon: Contact,
    isPro: false,
    isExternal: true,
  },
];

export default function Navbar() {
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- LOGIKA SCROLL ---
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    // Jika scroll lebih dari 20px, ubah state
    if (latest > 20) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });
  // -------------------------------

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialize from URL to prevent flashing/resetting on refresh
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');

  const isAssetsPage = pathname === '/assets';

  const debouncedSearch = useDebounce(searchValue, 300);
  const debouncedSearchRef = useRef(debouncedSearch);

  useEffect(() => {
    debouncedSearchRef.current = debouncedSearch;
  }, [debouncedSearch]);

  // Sync FROM URL to Local State
  useEffect(() => {
    if (isAssetsPage) {
      const q = searchParams.get('q') || '';
      // If URL is different from our current debounced value, it means the change came from outside (navigation/url), so we sync.
      if (q !== debouncedSearchRef.current) {
        setSearchValue(q);
      }
    }
  }, [isAssetsPage, searchParams]);

  // Sync TO URL from Local State
  useEffect(() => {
    if (isAssetsPage) {
      const currentQ = searchParams.get('q') || '';
      // Only push if debounced value is different from URL
      if (debouncedSearch !== currentQ) {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearch) {
          params.set('q', debouncedSearch);
        } else {
          params.delete('q');
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }
  }, [debouncedSearch, isAssetsPage, pathname, router, searchParams]);

  return (
    <section className="md:mb-30 mb-20">
      <SearchCommand open={isSearchOpen} setOpen={setIsSearchOpen} />
      <nav
        className={`left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'fixed top-0' // Saat discroll menempel di atas
            : 'absolute md:top-20' // Posisi awal (Floating Island)
        }`}
      >
        <div
          className={`mx-auto sm:px-6 lg:px-8 h-full transition-all duration-300 ${
            isScrolled
              ? 'w-full bg-white/80 backdrop-blur-md border-b border-gray-200 rounded-none shadow-sm' // Style saat Fixed (Lebar Full)
              : 'max-w-6xl lg:w-full bg-[#F7F7F7] rounded-2xl md:rounded-3xl border border-transparent' // Style Awal (Rounded Island)
          }`}
        >
          <div className="hidden lg:flex justify-between items-center h-16 gap-4 px-4">
            <div className="flex items-center gap-8">
              <div className="w-9 h-9 relative p-1.5 rounded-xl shadow-sm flex  bg-gradient-to-b from-orange-600/0 to-orange-600/80 items-center justify-center overflow-hidden bg-white border border-gray-100">
                <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-orange-600/0 to-orange-600/40 z-40 pointer-events-none"></span>

                {/* 2. Logo Image 
      - Gunakan 'z-10' (depan) agar logo tajam dan tidak tertutup gradient.
      - Gunakan 'object-contain' agar logo tidak terpotong.
  */}
                <Image
                  src="/logo.svg"
                  alt="MoonUI Logo"
                  width={100}
                  height={100}
                  className="w-full h-full object-contain relative z-10"
                />
              </div>

              <div className="flex items-center gap-6">
                {MENU_ITEMS.map((label, idx) => (
                  <Link
                    key={idx}
                    href={label.href}
                    className="text-sm font-medium flex gap-2 justify-center items-center text-neutral-500 hover:text-black transition-colors"
                  >
                    <label.icon className="size-4 hover:text-[#FF4F00] text-gray-400" />
                    {label.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isAssetsPage ? (
                <div className="w-64 h-9 px-2 bg-zinc-100 rounded-lg border border-zinc-200 flex items-center gap-2 hover:bg-zinc-200/50 transition-colors focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500">
                  <Search size={14} className="text-zinc-400 ml-1" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search assets..."
                    className="bg-transparent border-none outline-none text-sm text-zinc-700 w-full placeholder:text-zinc-400 h-full"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-64 h-9 px-2 bg-zinc-100 rounded-lg border border-zinc-200 flex items-center gap-2 hover:bg-zinc-200/50 transition-colors text-left"
                >
                  <Search size={14} className="text-zinc-400 ml-1" />
                  <span className="text-sm text-zinc-400 flex-1">
                    Quick search...
                  </span>
                  <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-zinc-500">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </button>
              )}

              {session?.user ? (
                <div className="flex items-center gap-3 pl-2">
                  <div className="text-right hidden xl:block">
                    <p className="text-sm font-medium text-gray-700">
                      {session.user.name}
                    </p>
                    <p className="text-[10px] text-gray-400">Pro Plan</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 ring-orange-500/20 transition-all">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-600 text-white font-bold">
                        {session.user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button className="h-9 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-gray-50">
                    Sign in
                  </button>
                  <button className="h-9 px-4 bg-zinc-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-zinc-700">
                    <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>{' '}
                    Sign up for Pro
                  </button>
                </>
              )}
            </div>
          </div>

          {/* --- MOBILE HEADER --- */}
          <div className="flex md:hidden justify-between items-center h-16 gap-3 px-4">
            {!isAssetsPage && (
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 relative rounded overflow-hidden bg-gray-100">
                  <img
                    src="https://placehold.co/52x58"
                    alt="Logo"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="px-2 py-1 bg-zinc-100 rounded-md border border-gray-200 flex items-center gap-1 shadow-sm">
                  <span className="text-xs font-medium text-gray-600">
                    v1.2
                  </span>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            )}

            <div
              className={`flex items-center gap-3 ${
                isAssetsPage ? 'flex-1 w-full' : ''
              }`}
            >
              {isAssetsPage ? (
                <div className="flex-1 h-9 px-2 bg-zinc-100 rounded-lg border border-zinc-200 flex items-center gap-2 focus-within:border-orange-500 w-full">
                  <Search size={16} className="text-zinc-400" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm text-zinc-700 w-full placeholder:text-zinc-400"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
                >
                  <Search size={18} />
                </button>
              )}

              {/* Mobile Avatar (Navbar) */}
              {session?.user && (
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-200 shrink-0">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-600 text-white text-xs font-bold">
                      {session.user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setIsOpen(true)}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 shrink-0"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE SIDEBAR --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 z-[60] backdrop-blur-sm lg:hidden"
          />
        )}
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-full sm:w-[320px] bg-zinc-50 z-[70] lg:hidden flex flex-col"
          >
            {/* Header Sidebar */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 bg-zinc-50 sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-600 rounded-lg"></div>
                <span className="font-semibold text-gray-800">Menu</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="size-6 text-gray-700"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* List Menu */}
            <div className="flex-1 overflow-y-auto">
              <motion.div
                className="px-6 flex flex-col"
                initial="closed"
                animate="open"
              >
                {/* GoPro Card */}
                <div className="mb-4">
                  <GoProCard />
                </div>

                {MENU_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className="py-5 flex items-center gap-3 border-b border-dashed border-gray-200"
                  >
                    <item.icon className="size-6 text-gray-400" />
                    <span className="text-gray-700 font-medium">
                      {item.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Sidebar Footer (Login/Profile) */}
            <div className="p-5 border-t border-gray-200 bg-white shrink-0 pb-8">
              {session?.user ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-600 text-white font-bold">
                        {session.user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button className="h-10 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-gray-50 w-full">
                    Sign in
                  </button>
                  <button className="h-10 px-4 bg-zinc-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-zinc-700 w-full">
                    <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
                    Sign up for Pro
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
