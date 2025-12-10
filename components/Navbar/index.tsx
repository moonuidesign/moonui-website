'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Menu,
  X,
  Monitor,
  LayoutTemplate,
  FileImage,
  BookOpen,
  Map,
  PenTool,
  Info,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { SearchCommand } from '../SearchCommand';

// --- DATA MENU ITEM (Sama seperti sebelumnya) ---
const MOBILE_MENU_ITEMS = [
  { label: 'Blocks', href: '#', icon: Monitor, isPro: true, isExternal: true },
  {
    label: 'Templates',
    href: '#',
    icon: LayoutTemplate,
    isPro: true,
    isExternal: true,
  },
  {
    label: 'Figma File',
    href: '#',
    icon: FileImage,
    isPro: true,
    isExternal: true,
  },
  { label: 'Docs', href: '#', icon: BookOpen, isPro: false, isExternal: false },
  { label: 'Roadmap', href: '#', icon: Map, isPro: false, isExternal: false },
  { label: 'Blog', href: '#', icon: PenTool, isPro: false, isExternal: false },
  { label: 'About', href: '#', icon: Info, isPro: false, isExternal: false },
  { label: 'Contact', href: '#', icon: Mail, isPro: false, isExternal: false },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Untuk Mobile Menu Sidebar
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Untuk Command Search Dialog

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      {/* --- MOUNT SEARCH COMMAND --- */}
      {/* Kita taruh di sini agar bisa diakses global, state dikontrol Navbar */}
      <SearchCommand open={isSearchOpen} setOpen={setIsSearchOpen} />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* --- DESKTOP VIEW --- */}
          <div className="hidden lg:flex justify-between items-center h-16 gap-4">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="w-9 h-9 bg-gradient-to-b from-orange-600/0 to-orange-600/80 rounded-xl shadow-sm border border-gray-200"></div>

              {/* Links */}
              <div className="flex items-center gap-6">
                {['Components', 'Templates', 'What’s new?'].map(
                  (label, idx) => (
                    <Link
                      key={idx}
                      href="#"
                      className="text-sm font-medium text-neutral-500 hover:text-black transition-colors"
                    >
                      {label}
                    </Link>
                  ),
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* SEARCH BAR (TRIGGER) */}
              {/* Ubah div menjadi button agar bisa diklik */}
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

              <button className="h-9 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-gray-50">
                Sign in
              </button>
              <button className="h-9 px-4 bg-zinc-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-zinc-700">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>{' '}
                Sign up for Pro
              </button>
            </div>
          </div>

          {/* --- MOBILE HEADER --- */}
          <div className="flex lg:hidden justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 relative rounded overflow-hidden bg-gray-100">
                <img
                  src="https://placehold.co/52x58"
                  alt="Logo"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="px-2 py-1 bg-zinc-100 rounded-md border border-gray-200 flex items-center gap-1 shadow-sm">
                <span className="text-xs font-medium text-gray-600">v1.2</span>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* MOBILE SEARCH TRIGGER */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
              >
                <Search size={18} />
              </button>

              <button
                onClick={() => setIsOpen(true)}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE SIDEBAR (Tidak Berubah) --- */}
      <AnimatePresence>
        {isOpen && (
          /* ... (Kode sidebar mobile Anda yang lama tetap sama di sini) ... */
          /* Saya singkat agar fokus pada bagian Search */
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
            className="fixed top-0 left-0 h-full w-full sm:w-[320px] bg-zinc-50 z-[70] lg:hidden flex flex-col overflow-y-auto"
          >
            {/* ... Isi Sidebar sama persis seperti kode Anda sebelumnya ... */}
            {/* Header Sidebar */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 bg-zinc-50 sticky top-0 z-10">
              {/* ... */}
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="size-6 text-gray-700"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            {/* List Menu */}
            <motion.div
              className="px-6 flex flex-col"
              initial="closed"
              animate="open"
            >
              {MOBILE_MENU_ITEMS.map((item, i) => (
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
