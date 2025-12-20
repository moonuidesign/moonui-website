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
            className="fixed inset-y-0 right-0 z-[101] w-[320px] bg-white shadow-2xl lg:hidden flex flex-col h-full rounded-l-[32px] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Filters</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content (Sidebar Filter) */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              <SidebarFilter
                {...sidebarProps}
                className="w-full static shadow-none p-0 sticky-0"
              />
            </div>

            {/* Footer / Actions if needed */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={onClose}
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-medium active:scale-95 transition-all"
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
