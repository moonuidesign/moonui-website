'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import SidebarFilter, { SidebarFilterProps } from './sidebar';

interface MobileFilterDrawerProps extends SidebarFilterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  ...sidebarProps
}: MobileFilterDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[101] flex h-full w-[320px] flex-col overflow-hidden rounded-l-[32px] bg-white shadow-2xl lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h2 className="text-lg font-bold text-gray-800">Filters</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content (Sidebar Filter) */}
            <div className="scrollbar-hide flex-1 overflow-y-auto p-4">
              <SidebarFilter {...sidebarProps} className="sticky-0 static w-full p-0 shadow-none" />
            </div>

            {/* Footer / Actions if needed */}
            <div className="border-t border-gray-100 bg-gray-50/50 p-4">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-zinc-900 py-3 font-medium text-white transition-all"
              >
                Show Results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
