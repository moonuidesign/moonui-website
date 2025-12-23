// components/sidebar/TierFilter.tsx
'use client';

import React from 'react';
import { cn } from '@/libs/utils';
import { TierType, useFilter } from '@/contexts';

export const TierFilter = () => {
  const { selectedTiers, toggleTier } = useFilter();
  const tiers: TierType[] = ['free', 'pro'];

  return (
    <div className="w-full pt-1 pb-3 lg:pb-4 bg-white rounded-xl lg:rounded-2xl shadow-card-sm flex flex-col gap-2 overflow-hidden mb-3 lg:mb-4">
      <div className="w-full h-7 lg:h-8 px-3 flex justify-between items-center">
        <span className="text-[#3D3D3D] text-[11px] lg:text-xs font-medium font-['Inter']">
          License Tier
        </span>
      </div>

      <div className="w-full px-3 flex flex-wrap gap-1.5 lg:gap-2">
        {/* All Option */}
        <button
          onClick={() => {
            selectedTiers.forEach((t) => toggleTier(t));
          }}
          className={cn(
            'h-7 lg:h-8 px-3 lg:px-4 rounded-full text-xs font-medium transition-all border',
            selectedTiers.length === 0
              ? 'bg-orange-600 text-white border-orange-600'
              : 'bg-white text-zinc-600 border-zinc-200 hover:border-orange-400 hover:text-orange-600',
          )}
        >
          All
        </button>

        {tiers.map((tier) => {
          const isActive = selectedTiers.includes(tier);
          return (
            <button
              key={tier}
              onClick={() => toggleTier(tier)}
              className={cn(
                'h-7 lg:h-8 px-3 lg:px-4 rounded-full text-xs font-medium capitalize transition-all border',
                isActive
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-orange-400 hover:text-orange-600',
              )}
            >
              {tier.replace('_', ' ')}
            </button>
          );
        })}
      </div>
    </div>
  );
};
