// components/layout/SectionHeader.tsx
'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/libs/utils'; // Pastikan path ini benar
interface SectionHeaderSkeletonProps {
  className?: string;
}

export const SectionHeaderSkeleton: React.FC<SectionHeaderSkeletonProps> = ({
  className,
}) => {
  return (
    <div className={cn('w-full flex items-center gap-4 mb-6 mt-2', className)}>
      {/* 1. Title Skeleton */}
      {/* Menggunakan h-8 agar tingginya mirip dengan text-2xl */}
      <div className="h-8 w-32 md:w-48 bg-zinc-200 rounded-lg animate-pulse" />

      {/* 2. Divider Line */}
      {/* Garis biarkan statis (tidak pulse) sebagai struktur layout */}
      <div className="flex-1 h-px bg-gray-200" />

      {/* 3. Badge/Counter Skeleton */}
      {/* Menggunakan rounded-2xl agar bentuknya kapsul seperti aslinya */}
      <div className="h-8 w-36 bg-zinc-200 rounded-2xl border border-transparent animate-pulse" />
    </div>
  );
};
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
