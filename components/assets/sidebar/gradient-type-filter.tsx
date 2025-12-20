// components/sidebar/GradientTypeFilter.tsx
'use client';

import React from 'react';
import { cn } from '@/libs/utils';
import { Circle, BoxSelect, Cone } from 'lucide-react'; // Icon simulasi
import { GradientType, useFilter } from '@/contexts';

export const GradientTypeFilter = () => {
  const { gradientTypes, toggleGradientType, contentType } = useFilter();

  // Hanya render jika contentType adalah gradients
  if (contentType !== 'gradients') return null;

  const types: { id: GradientType; label: string; icon: React.ElementType }[] =
    [
      { id: 'linear', label: 'Linear', icon: BoxSelect },
      { id: 'radial', label: 'Radial', icon: Circle },
      { id: 'conic', label: 'Conic', icon: Cone },
    ];

  return (
    <div className="w-full pt-1 pb-4 bg-white rounded-2xl shadow-card-sm flex flex-col gap-2 overflow-hidden mb-4 animate-in zoom-in-95 duration-300">
      <div className="w-full h-8 px-3 flex justify-between items-center">
        <span className="text-[#3D3D3D] text-xs font-medium font-['Inter']">
          Gradient Type
        </span>
      </div>

      <div className="w-full px-3 flex flex-wrap gap-2">
        {types.map((t) => {
          const isActive = gradientTypes.includes(t.id);
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => toggleGradientType(t.id)}
              className={cn(
                'h-8 flex-1 px-2 rounded-lg border flex items-center justify-center gap-2 transition-all',
                isActive
                  ? 'bg-zinc-800 text-white border-zinc-800 shadow-sm'
                  : 'bg-white text-zinc-600 border-gray-200 hover:bg-gray-50',
              )}
            >
              <Icon className="w-3 h-3" />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
