// components/sidebar/TierFilter.tsx
'use client';

import React from 'react';
import { cn } from '@/libs/utils';
import { TierType, useFilter } from '@/contexts';

export const TierFilter = () => {
  const { selectedTiers, toggleTier } = useFilter();
  const tiers: TierType[] = ['free', 'pro'];

  return (
    <div className="shadow-card-sm flex w-full flex-col gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white pt-1 pb-3 shadow-sm lg:rounded-2xl lg:pb-4">
      <div className="flex h-7 w-full items-center justify-between px-3 lg:h-8">
        <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-gray-800 lg:text-sm">
          License Tier
        </span>
      </div>

      <div className="flex w-full flex-wrap gap-1.5 px-3 lg:gap-2">
        {/* All Option */}
        <button
          onClick={() => {
            selectedTiers.forEach((t) => toggleTier(t));
          }}
          className={cn(
            'h-7 rounded-full border px-3 text-xs font-medium transition-all lg:h-8 lg:px-4',
            selectedTiers.length === 0
              ? 'border-orange-600 bg-orange-600 text-white'
              : 'border-zinc-200 bg-white text-zinc-600 hover:border-orange-400 hover:text-orange-600',
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
                'h-7 rounded-full border px-3 text-xs font-medium capitalize transition-all lg:h-8 lg:px-4',
                isActive
                  ? 'border-orange-600 bg-orange-600 text-white'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-orange-400 hover:text-orange-600',
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
