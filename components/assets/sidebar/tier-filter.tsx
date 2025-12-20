// components/sidebar/TierFilter.tsx
'use client';

import React from 'react';
import { cn } from '@/libs/utils';
import { Check } from 'lucide-react';
import { TierType, useFilter } from '@/contexts';

export const TierFilter = () => {
  const { selectedTiers, toggleTier } = useFilter();
  const tiers: TierType[] = ['free', 'pro'];

  return (
    <div className="w-full pt-1 pb-4 bg-white rounded-2xl shadow-card-sm flex flex-col gap-2 overflow-hidden mb-4">
      <div className="w-full h-8 px-3 flex justify-between items-center">
        <span className="text-[#3D3D3D] text-xs font-medium font-['Inter']">
          License Tier
        </span>
      </div>

      <div className="w-full px-3 flex flex-col gap-2">
        {/* All Option */}
        <button
          onClick={() => {
            // Clear all selected tiers to represent "All"
            // We need to access a method to clear tiers, but toggleTier(t) only toggles one.
            // Best way is to iterate and toggle off, or ideally use `useFilterStore` to set directly.
            // Since we only have toggleTier exposed via useFilter (which is useFilterStore),
            // let's assume we can add a helper or just manually clear if needed.
            // Actually, `useFilter` IS `useFilterStore`.
            // We can just set selectedTiers to [] directly if the interface allowed,
            // but let's check if we can modify the store or just toggle all current ones off.
            // Or better: Modify the store to expose a clearTiers method.
            // For now, let's use the toggleTier loop hack or modify the store in a separate step if needed.
            // Wait, useFilter returns the store.
            // Let's import useFilterStore directly to be safe if useFilter is a wrapper?
            // In contexts/index.tsx, useFilter IS useFilterStore.
            // So we can access setState or add a clearTiers action.
            // But I cannot modify contexts/index.tsx right now easily without checking it again.
            // I'll stick to iterating active tiers to toggle them OFF.
            selectedTiers.forEach((t) => toggleTier(t));
          }}
          className="group flex items-center justify-between w-full h-8 px-2 hover:bg-zinc-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-4 h-4 rounded border flex items-center justify-center transition-all',
                selectedTiers.length === 0
                  ? 'bg-orange-600 border-orange-600'
                  : 'border-zinc-300 group-hover:border-orange-400',
              )}
            >
              {selectedTiers.length === 0 && (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </div>
            <span className="text-zinc-700 text-xs font-medium capitalize">
              All
            </span>
          </div>
        </button>

        {tiers.map((tier) => {
          const isActive = selectedTiers.includes(tier);
          return (
            <button
              key={tier}
              onClick={() => {
                 // If "All" was previously selected (empty array), and we click a tier, it just adds it.
                 toggleTier(tier)
              }}
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
