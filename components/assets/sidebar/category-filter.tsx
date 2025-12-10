// components/sidebar/CategoryFilter.tsx
'use client';

import React from 'react';
import { cn } from '@/libs/utils';
import type { NavCategoryItem } from '@/types/category';

interface CategoryFilterProps {
  title: string;
  categories: NavCategoryItem[];
  activeSlugs: string[]; // Terima Array
  onToggle: (slug: string) => void; // Fungsi Toggle
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  title,
  categories,
  activeSlugs,
  onToggle,
}) => {
  return (
    <div className="w-full pt-1 pb-4 bg-white rounded-2xl shadow-card-sm flex flex-col gap-2 overflow-hidden animate-in slide-in-from-left-2 duration-300">
      <div className="w-full h-8 px-3 flex justify-between items-center">
        <span className="text-zinc-800 text-xs font-medium font-['Inter']">
          {title}
        </span>
      </div>

      <div className="w-full px-3 flex flex-wrap gap-2 content-start">
        {/* Tombol All */}
        <button
          onClick={() => onToggle('all')}
          className={cn(
            "h-7 px-3 rounded-lg flex items-center justify-center transition-all text-xs font-medium font-['Inter'] border",
            activeSlugs.length === 0 // Jika array kosong, berarti 'All' aktif
              ? 'bg-zinc-800 text-white border-zinc-800 shadow-md'
              : 'bg-stone-50 text-zinc-800 border-transparent hover:border-gray-200 hover:bg-gray-100',
          )}
        >
          All
        </button>

        {/* Loop Categories */}
        {categories.map((cat) => {
          const isActive = activeSlugs.includes(cat.slug);
          return (
            <button
              key={cat.id}
              onClick={() => onToggle(cat.slug)}
              className={cn(
                "h-7 px-3 rounded-lg flex items-center justify-center transition-all text-xs font-medium font-['Inter'] border",
                isActive
                  ? 'bg-zinc-800 text-white border-zinc-800 shadow-md'
                  : 'bg-stone-50 text-zinc-800 border-transparent hover:border-gray-200 hover:bg-gray-100',
              )}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
