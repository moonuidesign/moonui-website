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
    <div className="w-full pt-1 pb-4 bg-white rounded-2xl shadow-card-sm flex flex-col gap-2 overflow-hidden mb-4 animate-in fade-in zoom-in duration-300">
      <div className="w-full h-8 px-3 flex justify-between items-center">
        <span className="text-zinc-800 text-xs font-medium font-['Inter']">
          Filter by Color
        </span>
      </div>

      <div className="w-full px-3 flex flex-wrap gap-2">
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
                'w-6 h-6 rounded-full border flex items-center justify-center transition-all shadow-sm relative',
                isActive
                  ? 'ring-2 ring-offset-1 ring-zinc-400 border-transparent'
                  : 'border-zinc-200 hover:scale-110',
              )}
              style={{ backgroundColor: color.value }}
              title={color.label}
            >
              {isActive && (
                <Check
                  className={cn(
                    'w-3 h-3',
                    color.id === 'white' || color.id === 'yellow'
                      ? 'text-black'
                      : 'text-white',
                  )}
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}

        {/* 2. Render CUSTOM COLOR PICKER (Posisi Terakhir) */}
        <div className="relative w-6 h-6 group">
          {/* Input invisible yang menutupi tombol */}
          <input
            type="color"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleCustomColorChange}
          />

          {/* Tampilan Visual Tombol Picker */}
          <div className="w-full h-full rounded-full bg-conic-gradient border border-zinc-200 flex items-center justify-center group-hover:scale-110 transition-transform bg-[conic-gradient(from_180deg_at_50%_50%,#FF0000_0deg,#00FF00_120deg,#0000FF_240deg,#FF0000_360deg)]">
            <Plus
              className="w-3 h-3 text-white drop-shadow-md"
              strokeWidth={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
