// components/layout/SectionHeader.tsx
'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/libs/utils'; // Pastikan path ini benar

interface SectionHeaderProps {
  title: string;
  href?: string;
  className?: string;
  startIndex: number;
  endIndex: number;
  totalItems: number; // Tambahkan ini
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  href = '#',
  className,
  startIndex,
  endIndex,
  totalItems,
}) => {
  return (
    <div className={cn('w-full flex items-center gap-4 mb-6 mt-2', className)}>
      <h2 className="text-[#3D3D3D] text-2xl font-bold font-['Plus_Jakarta_Sans'] whitespace-nowrap capitalize">
        {title}
      </h2>
      <div className="flex-1 h-px bg-gray-200" />
      <div className="h-8 px-3 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-1 hover:bg-gray-50 transition-colors group">
        <div className="text-sm text-zinc-400">
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
          {totalItems}
        </div>
        <ChevronRight className="w-3 h-3 text-[#3D3D3D] group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
