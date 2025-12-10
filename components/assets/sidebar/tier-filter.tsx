// components/sidebar/TierFilter.tsx
'use client';

import React from 'react';
import { cn } from '@/libs/utils';
import { Check } from 'lucide-react';
import { TierType, useFilter } from '@/contexts';

export const TierFilter = () => {
  const { selectedTiers, toggleTier } = useFilter();
  const tiers: TierType[] = ['free', 'pro', 'pro_plus'];

  return (
    <div className="w-full pt-1 pb-4 bg-white rounded-2xl shadow-card-sm flex flex-col gap-2 overflow-hidden mb-4">
      <div className="w-full h-8 px-3 flex justify-between items-center">
        <span className="text-zinc-800 text-xs font-medium font-['Inter']">
          License Tier
        </span>
      </div>

      <div className="w-full px-3 flex flex-col gap-2">
        {tiers.map((tier) => {
          const isActive = selectedTiers.includes(tier);
          return (
            <button
              key={tier}
              onClick={() => toggleTier(tier)}
              className="group flex items-center justify-between w-full h-8 px-2 hover:bg-zinc-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                {/* Custom Checkbox */}
                <div
                  className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-all',
                    isActive
                      ? 'bg-orange-600 border-orange-600'
                      : 'border-zinc-300 group-hover:border-orange-400',
                  )}
                >
                  {isActive && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </div>

                <span className="text-zinc-700 text-xs font-medium capitalize">
                  {tier.replace('_', ' ')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
