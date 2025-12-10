// components/layout/SectionHeader.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/libs/utils'; // Pastikan path ini benar

interface SectionHeaderProps {
  title: string;
  href?: string;
  className?: string; // Tambahkan ini
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  href = '#',
  className,
}) => {
  return (
    <div className={cn('w-full flex items-center gap-4 mb-6 mt-2', className)}>
      <h2 className="text-zinc-800 text-2xl font-bold font-['Plus_Jakarta_Sans'] whitespace-nowrap capitalize">
        {title}
      </h2>
      <div className="flex-1 h-px bg-gray-200" />
      <Link
        href={href}
        className="h-8 px-3 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-1 hover:bg-gray-50 transition-colors group"
      >
        <span className="text-zinc-800 text-xs font-medium">See more</span>
        <ChevronRight className="w-3 h-3 text-zinc-800 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
};
