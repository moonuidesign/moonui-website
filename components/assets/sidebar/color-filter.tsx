// components/sidebar/colorFilter.tsx
'use client';

import React from 'react';
import { cn } from '@/libs/utils';
import { Check, Plus } from 'lucide-react';
import { useFilter } from '@/contexts';

// Preset Colors
const PRESET_COLORS = [
  { id: 'red', value: '#EF4444', label: 'Red' },
  { id: 'orange', value: '#F97316', label: 'Orange' },
  { id: 'yellow', value: '#EAB308', label: 'Yellow' },
  { id: 'green', value: '#22C55E', label: 'Green' },
  { id: 'blue', value: '#3B82F6', label: 'Blue' },
  { id: 'purple', value: '#A855F7', label: 'Purple' },
  { id: 'pink', value: '#EC4899', label: 'Pink' },
  { id: 'black', value: '#18181b', label: 'Dark' },
  { id: 'white', value: '#ffffff', label: 'Light' },
];

export const ColorFilter = () => {
  const { contentType, selectedColors, toggleColor } = useFilter();

  if (contentType !== 'gradients') return null;

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hexColor = e.target.value;
    // Tambahkan warna custom ke filter
    // Note: Kita mungkin perlu debounce di real app, tapi ini cukup untuk sekarang
    toggleColor(hexColor);
  };

  return (
    <div className="shadow-card-sm animate-in fade-in zoom-in flex w-full flex-col gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white pt-1 pb-3 shadow-sm duration-300 lg:rounded-2xl lg:pb-4">
      <div className="flex h-7 w-full items-center justify-between px-3 lg:h-8">
        <span className="font-['Inter'] text-[11px] font-medium text-[#3D3D3D] lg:text-xs">
          Filter by Color
        </span>
      </div>

      <div className="flex w-full flex-wrap gap-1.5 px-3 lg:gap-2">
        {/* 1. Render PRESET Colors */}
        {PRESET_COLORS.map((color) => {
          // Cek apakah ID (red) atau Value (#EF4444) ada di selectedColors
          // Kita gunakan ID untuk preset agar bersih
          const isActive = selectedColors.includes(color.id);

          return (
            <button
              key={color.id}
              onClick={() => toggleColor(color.id)}
              className={cn(
                'relative flex h-6 w-6 items-center justify-center rounded-full border shadow-sm transition-all',
                isActive
                  ? 'border-transparent ring-2 ring-zinc-400 ring-offset-1'
                  : 'border-zinc-200 hover:scale-110',
              )}
              style={{ backgroundColor: color.value }}
              title={color.label}
            >
              {isActive && (
                <Check
                  className={cn(
                    'h-3 w-3',
                    color.id === 'white' || color.id === 'yellow' ? 'text-black' : 'text-white',
                  )}
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}

        {/* 2. Render CUSTOM COLOR PICKER (Posisi Terakhir) */}
        <div className="group relative h-6 w-6">
          {/* Input invisible yang menutupi tombol */}
          <input
            type="color"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            onChange={handleCustomColorChange}
          />

          {/* Tampilan Visual Tombol Picker */}
          <div className="bg-conic-gradient flex h-full w-full items-center justify-center rounded-full border border-zinc-200 bg-[conic-gradient(from_180deg_at_50%_50%,#FF0000_0deg,#00FF00_120deg,#0000FF_240deg,#FF0000_360deg)] transition-transform group-hover:scale-110">
            <Plus className="h-3 w-3 text-white drop-shadow-md" strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
};
