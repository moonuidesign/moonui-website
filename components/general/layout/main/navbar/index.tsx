/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion';
import {
  Search,
  Menu,
  X,
  LayoutTemplate,
  Contact,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce'; // Pastikan path ini benar
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { Note } from 'iconsax-reactjs';
import { useMediaQuery } from 'react-responsive';
import { SearchCommand } from './search-command'; // Pastikan path ini benar
import { GoProCard } from '@/components/assets/sidebar'; // Pastikan path ini benar
import { cn } from '@/libs/utils';

export * from './search-command';

const MENU_ITEMS = [
  { label: 'Assets', href: '/assets', icon: LayoutTemplate },
  { label: 'About Us', href: '/about', icon: Note },
  { label: 'Contact', href: '/contact', icon: Contact },
  { label: 'Pricing', href: '/pricing', icon: Contact },
];
export function SkeletonNavbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-zinc-200/80', className)}
      {...props}
    />
  );
}
export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // --- 2. MEDIA QUERIES ---
  const isDesktop = useMediaQuery({ query: '(min-width: 992px)' });
  const isTablet = useMediaQuery({
    query: '(min-width: 768px) and (max-width: 991px)',
  });

  // --- 3. PROFILE POPOVER STATE ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- 4. SCROLL LOGIC ---
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    // Fungsi cek manual agar saat refresh langsung detect posisi
    const checkScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    checkScroll();
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  // --- 5. SEARCH & URL LOGIC ---
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  const isAssetsPage = pathname === '/assets';
  const debouncedSearch = useDebounce(searchValue, 300);
  const debouncedSearchRef = useRef(debouncedSearch);

  useEffect(() => {
    debouncedSearchRef.current = debouncedSearch;
  }, [debouncedSearch]);

  useEffect(() => {
    if (isAssetsPage) {
      const q = searchParams.get('q') || '';
      if (q !== debouncedSearchRef.current) setSearchValue(q);
    }
  }, [isAssetsPage, searchParams]);

  useEffect(() => {
    if (isAssetsPage) {
      const currentQ = searchParams.get('q') || '';
      if (debouncedSearch !== currentQ) {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearch) params.set('q', debouncedSearch);
        else params.delete('q');
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }
  }, [debouncedSearch, isAssetsPage, pathname, router, searchParams]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <section className="h-24 relative z-[1000]">
      <SearchCommand open={isSearchOpen} setOpen={setIsSearchOpen} />

      <div className="fixed top-10 mx-auto container left-0 right-0 flex justify-center pt-6 pointer-events-none z-[60]">
        <motion.nav
          initial={{
            maxWidth: isDesktop ? '80rem' : isTablet ? '64rem' : '86rem',

            y: 0,
          }}
          animate={{
            maxWidth: isScrolled
              ? isDesktop
                ? '72rem'
                : isTablet
                  ? '48rem'
                  : '86rem'
              : isDesktop
                ? '80rem'
                : isTablet
                  ? '64rem'
                  : '86rem',
            y: isScrolled ? -55 : 0,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto relative w-full h-16 md:h-20 px-4 md:px-3 grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-2 mx-auto"
        >
          {/* Background Mobile Fallback */}
          <div className="md:hidden absolute inset-0 bg-white/80 backdrop-blur-md shadow-sm border border-gray-200/60 rounded-full -z-10 md:mx-2" />

          {/* 1. LEFT: LOGO & MOBILE SEARCH */}
          <div className="flex justify-start items-center w-full">
            <motion.div
              className="w-9 h-9 relative p-1.5 flex items-center justify-center shrink-0"
              animate={{
                opacity: isMobileSearchExpanded ? 0 : 1,
                width: isMobileSearchExpanded ? 0 : 36,
                marginRight: isMobileSearchExpanded ? 0 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <span
                className="absolute inset-0 bg-gradient-to-b hover:from-[#FF4F00]/0 hover:to-[#FF4F00] from-[#1B1B1B]/0 to-[#1B1B1B]/80 z-20 "
                style={{
                  maskImage: "url('/logo.svg')",
                  WebkitMaskImage: "url('/logo.svg')",
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                }}
              ></span>
            </motion.div>

            {/* Mobile Search - Expandable on /assets */}
            <div className="md:hidden ml-3 flex items-center">
              {isAssetsPage ? (
                <motion.div
                  className="flex items-center overflow-hidden"
                  initial={false}
                  animate={{
                    width: isMobileSearchExpanded ? 'calc(100vw - 120px)' : 36,
                  }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div
                    className={`h-9 flex items-center gap-2 border border-gray-200 rounded-full bg-white/80 transition-all ${isMobileSearchExpanded ? 'w-full px-3' : 'w-9 justify-center'
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (isMobileSearchExpanded) {
                          setIsMobileSearchExpanded(false);
                          setSearchValue('');
                        } else {
                          setIsMobileSearchExpanded(true);
                          setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
                        }
                      }}
                      className="shrink-0 text-gray-500 hover:text-gray-700"
                    >
                      {isMobileSearchExpanded ? <X size={18} /> : <Search size={18} />}
                    </button>

                    <AnimatePresence>
                      {isMobileSearchExpanded && (
                        <motion.input
                          ref={mobileSearchInputRef}
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: '100%' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          type="text"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          placeholder="Search assets..."
                          className="bg-transparent border-none outline-none text-sm text-zinc-700 w-full placeholder:text-zinc-400 h-full"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 bg-white/50"
                >
                  <Search size={18} />
                </button>
              )}
            </div>
          </div>

          {/* 2. CENTER: MENU & SEARCH */}
          <div className="hidden relative justify-center md:flex items-center gap-4 px-4 py-4">
            {/* Animated Background Pill */}
            <motion.div
              initial={false}
              animate={{
                width:
                  isScrolled && isDesktop
                    ? '72rem'
                    : isScrolled && isTablet
                      ? '48rem'
                      : isScrolled
                        ? '92%'
                        : '100%',
                height: '100%',
                borderRadius: isScrolled ? '999px' : '9999px',
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 25,
              }}
              style={{
                position: 'absolute',
                left: '50%',
                x: '-50%',
                zIndex: -1,
              }}
              className="bg-white/80 backdrop-blur-md shadow-sm border border-gray-200/60"
            />

            <div className="flex items-center gap-4 lg:gap-6 w-full z-10">
              {MENU_ITEMS.map((label, idx) => (
                <Link
                  key={idx}
                  href={label.href}
                  className="text-sm font-medium flex gap-2 justify-center items-center text-neutral-500 hover:text-black transition-colors whitespace-nowrap"
                >
                  <span className="hidden lg:block"></span>
                  {label.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:block ml-2 lg:ml-4 z-10">
              {isAssetsPage ? (
                <div className="w-48 lg:w-64 h-9 px-2 bg-zinc-100/50 rounded-full border border-zinc-200 flex items-center gap-2 hover:bg-zinc-200/50 transition-colors focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500">
                  <Search size={14} className="text-zinc-400 ml-1" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm text-zinc-700 w-full placeholder:text-zinc-400 h-full"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-48 lg:w-64 h-9 px-2 bg-zinc-100/50 rounded-full border border-zinc-200 flex items-center gap-2 hover:bg-zinc-200/50 transition-colors text-left"
                >
                  <Search size={14} className="text-zinc-400 ml-1" />
                  <span className="text-sm text-zinc-400 flex-1 truncate">
                    Search...
                  </span>
                  <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded-full border bg-white px-1.5 font-mono text-[10px] font-medium text-zinc-500">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </button>
              )}
            </div>
          </div>

          {/* 3. RIGHT: ACTIONS */}
          <div className="flex items-center justify-end w-full gap-2 md:gap-4">
            {session?.user ? (
              <div className="relative z-50" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-1 rounded-full bg-[#1B1B1B] border hover:bg-[#ff4f00] transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-200 relative shrink-0">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt="User"
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-600 text-white font-bold text-xs md:text-sm">
                        {session.user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="text-left hidden xl:block xl:mr-2 ">
                    <p className="text-sm font-medium text-[#D3D3D3] group-hover:text-white transition-colors">
                      {session.user.name}
                    </p>
                    <p className="text-[10px] text-gray-300 group-hover:text-white transition-colors">
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
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-1.5"
                    >
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs font-medium text-gray-500">
                          Signed in as
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {session.user.email}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={16} />
                        Settings
                      </Link>

                      <div className="h-px bg-gray-100 my-1" />

                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <button className="h-9 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-gray-50">
                  Sign in
                </button>
              </div>
            )}

            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 bg-white/50"
            >
              <Menu size={18} />
            </button>
          </div>
        </motion.nav>
      </div>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 z-[60] backdrop-blur-sm md:hidden"
          />
        )}
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[85%] sm:w-[320px] bg-zinc-50 z-[70] md:hidden flex flex-col"
          >
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

            <div className="flex-1 overflow-y-auto">
              <motion.div
                className="px-6 flex flex-col"
                initial="closed"
                animate="open"
              >
                <div className="mb-4 mt-4">
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

            <div className="p-5 border-t border-gray-200 bg-white shrink-0 pb-8">
              {session?.user ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200 relative">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt="User"
                        fill
                        className="object-cover"
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
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
