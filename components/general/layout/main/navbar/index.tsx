/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import {
  Search,
  Menu,
  X,
  LayoutTemplate,
  Contact,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
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
export function SkeletonNavbar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-zinc-200/80', className)} {...props} />;
}
export default function Navbar() {
  const MotionLink = motion.create(Link);
  const { data: session, status } = useSession();
  const isSessionLoading = status === 'loading';
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
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
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
    <section className="relative z-[1010] h-24">
      <SearchCommand open={isSearchOpen} setOpen={setIsSearchOpen} />

      <div className="pointer-events-none fixed top-10 right-0 left-0 z-[60] container mx-auto flex justify-center pt-6">
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
          className="pointer-events-auto relative mx-auto grid h-16 w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-4 md:h-20 md:grid-cols-[1fr_auto_1fr] md:px-3"
        >
          <div className="absolute inset-0 -z-10 rounded-full border border-gray-200/60 bg-white/80 shadow-sm backdrop-blur-md md:mx-2 md:hidden" />
          <div className="flex w-full items-center justify-start">
            <MotionLink
              href="/"
              // Hapus p-1.5 karena kita akan atur ukuran child-nya saja agar otomatis di tengah
              className="group relative z-20 flex h-[45px] w-[45px] shrink-0 cursor-pointer items-center justify-center rounded-full outline-none select-none focus:ring-0 focus:outline-none"
              animate={{
                opacity: isMobileSearchExpanded ? 0 : 1,
                width: isMobileSearchExpanded ? 0 : 45,
                marginRight: isMobileSearchExpanded ? 0 : 0,
              }}
              transition={{ duration: 0.01 }}
            >
              <Image
                src="/logo.svg"
                alt="MoonUI"
                width={45}
                height={45}
                className="h-[45px] w-[45px] transition-all duration-300"
              />
            </MotionLink>

            {/* Mobile Search - Expandable on /assets */}
            <AnimatePresence>
              {!isMobileSearchExpanded && !isScrolled && (
                <MotionLink
                  href="/"
                  initial={{ opacity: 0, x: -30, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: -30, width: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="relative z-10 ml-2 hidden items-center overflow-hidden whitespace-nowrap md:flex"
                >
                  <Image
                    src="/logo-moonui.svg"
                    alt="MoonUI"
                    width={80}
                    height={24}
                    className="h-6 w-auto object-contain select-none"
                  />
                </MotionLink>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!isMobileSearchExpanded && !isScrolled && (
                <MotionLink
                  href="/"
                  initial={{ opacity: 0, x: -30, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: -30, width: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="relative z-10 ml-2 flex items-center overflow-hidden whitespace-nowrap md:hidden"
                >
                  <Image
                    src="/logo-moonui.svg"
                    alt="MoonUI"
                    width={70}
                    height={20}
                    className="h-5 w-auto object-contain select-none"
                  />
                </MotionLink>
              )}
            </AnimatePresence>
          </div>

          {/* 2. CENTER: MENU & SEARCH */}
          <div className="relative hidden items-center justify-center gap-4 px-4 py-4 md:flex">
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
              className="border border-gray-200/60 bg-white/80 shadow-sm backdrop-blur-md"
            />

            <div className="z-10 flex w-full items-center gap-4 lg:gap-6">
              {MENU_ITEMS.map((label, idx) => (
                <Link
                  key={idx}
                  href={label.href}
                  className="flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap text-neutral-500 transition-colors hover:text-black"
                >
                  <span className="hidden lg:block"></span>
                  {label.label}
                </Link>
              ))}
            </div>

            <div className="z-10 ml-2 hidden md:block lg:ml-4">
              {isAssetsPage ? (
                <div className="flex h-9 w-48 items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100/50 px-2 transition-colors focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 hover:bg-zinc-200/50 lg:w-64">
                  <Search size={14} className="ml-1 text-zinc-400" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search..."
                    className="h-full w-full border-none bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex h-9 w-48 items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100/50 px-2 text-left transition-colors hover:bg-zinc-200/50 lg:w-64"
                >
                  <Search size={14} className="ml-1 text-zinc-400" />
                  <span className="flex-1 truncate text-sm text-zinc-400">Search...</span>
                  <kbd className="hidden h-5 items-center gap-1 rounded-full border bg-white px-1.5 font-mono text-[10px] font-medium text-zinc-500 lg:inline-flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </button>
              )}
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-2 md:gap-4">
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
                      {session.user.roleUser === 'admin' ||
                        (session.user.roleUser === 'superadmin' && (
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <LayoutDashboard size={16} />
                            Dashboard
                          </Link>
                        ))}
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
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  href="/signin"
                  className="flex h-9 items-center rounded-full border border-[#D3D3D3] bg-white px-4 py-2 text-sm font-medium text-[#D3D3D3] text-neutral-600 shadow-[0_1px_1px_0.5px_rgba(41,41,41,0.04),0_3px_3px_-1.5px_rgba(41,41,41,0.02),0_6px_6px_-3px_rgba(41,41,41,0.04),0_12px_12px_-6px_rgba(41,41,41,0.04),0_24px_24px_-12px_rgba(41,41,41,0.04),0_48px_48px_-24px_rgba(41,41,41,0.04),0_0_0_1px_rgba(41,41,41,0.04),inset_0_-1px_1px_-0.5px_rgba(51,51,51,0.06)] hover:bg-[#FF4F00] hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/Get Started"
                  className="flex hidden h-9 items-center gap-2 rounded-full bg-[#1B1B1B] px-4 py-2 text-sm font-medium text-neutral-600 text-white shadow-[0_1px_1px_0.5px_rgba(41,41,41,0.04),0_3px_3px_-1.5px_rgba(41,41,41,0.02),0_6px_6px_-3px_rgba(41,41,41,0.04),0_12px_12px_-6px_rgba(41,41,41,0.04),0_24px_24px_-12px_rgba(41,41,41,0.04),0_48px_48px_-24px_rgba(41,41,41,0.04),0_0_0_1px_rgba(41,41,41,0.04),inset_0_-1px_1px_-0.5px_rgba(51,51,51,0.06)] hover:bg-[#FF4F00] md:hidden lg:flex"
                >
                  <Image src="/ic-diamond-small.svg" width={15} height={15} alt="arrow-right" />
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Search - Left of hamburger menu */}
            <div className="z-10 flex items-center md:hidden">
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
                    className={`flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white/80 transition-all ${
                      isMobileSearchExpanded ? 'w-full px-3' : 'w-9 justify-center'
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
                          className="h-full w-full border-none bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/50 text-gray-500 hover:bg-gray-50"
                >
                  <Search size={18} />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/50 text-gray-500 hover:bg-gray-50 md:hidden"
            >
              <Menu size={18} />
            </button>
          </div>
        </motion.nav>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm md:hidden"
          />
        )}
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-[70] flex h-full w-[85%] flex-col bg-zinc-50 sm:w-[320px] md:hidden"
          >
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-gray-200 bg-zinc-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B1B1B]">
                  {/* CONTAINER LOGO */}
                  <div
                    /* PERBAIKAN ADA DI SINI:
                      1. Ganti 'from-[#181818]' menjadi 'from-white' (atau warna terang).
                      2. Ganti 'to-transparent' menjadi 'to-gray-400' agar ada efek metallic/silver seperti di gambar.
                      3. Gunakan 'bg-gradient-to-b' (ke bawah) atau 'to-br' sesuai arah cahaya yang diinginkan.
                    */
                    className="h-6 w-6 bg-gradient-to-b from-white to-gray-500"
                    style={{
                      maskImage: 'url(/logo.svg)',
                      WebkitMaskImage: 'url(/logo.svg)',
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskPosition: 'center',
                    }}
                    role="img"
                    aria-label="Logo Bergradien"
                  />
                </div>
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
              <motion.div className="flex flex-col px-6" initial="closed" animate="open">
                {MENU_ITEMS.map((item, i) => (
                  <Link
                    href={item.href}
                    key={i}
                    className="flex items-center gap-3 border-b border-dashed border-gray-200 py-5"
                  >
                    <item.icon className="size-6 text-gray-400" />
                    <span className="font-medium text-gray-700">{item.label}</span>
                  </Link>
                ))}
              </motion.div>

              {isAssetsPage && (
                <div className="mt-4 mb-4 px-6">
                  <GoProCard />
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white p-5 pb-8">
              {isSessionLoading ? (
                <div className="flex items-center gap-3">
                  <SkeletonNavbar className="h-10 w-10 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <SkeletonNavbar className="h-4 w-24" />
                    <SkeletonNavbar className="h-3 w-32" />
                  </div>
                </div>
              ) : session?.user ? (
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-200">
                    {session.user.image ? (
                      <Image src={session.user.image} alt="User" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-orange-600 font-bold text-white">
                        {session.user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {session.user.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">{session.user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/signin"
                    className="flex h-10 w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-neutral-600 hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
