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

  const types: { id: GradientType; label: string; icon: React.ElementType }[] = [
    { id: 'linear', label: 'Linear', icon: BoxSelect },
    { id: 'radial', label: 'Radial', icon: Circle },
    { id: 'conic', label: 'Conic', icon: Cone },
  ];

  return (
    <div className="shadow-card-sm animate-in zoom-in-95 flex w-full flex-col gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white pt-1 pb-3 shadow-sm duration-300 lg:rounded-2xl lg:pb-4">
      <div className="flex h-7 w-full items-center justify-between px-3 lg:h-8">
        <span className="font-['Inter'] text-[11px] font-medium text-[#3D3D3D] lg:text-xs">
          Gradient Type
        </span>
      </div>

      <div className="flex w-full flex-wrap gap-1.5 px-3 lg:gap-2">
        {types.map((t) => {
          const isActive = gradientTypes.includes(t.id);
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => toggleGradientType(t.id)}
              className={cn(
                'flex h-8 flex-1 items-center justify-center gap-2 rounded-lg border px-2 transition-all',
                isActive
                  ? 'border-zinc-800 bg-zinc-800 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-zinc-600 hover:bg-gray-50',
              )}
            >
              <Icon className="h-3 w-3" />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
