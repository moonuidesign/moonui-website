// components/sidebar/appliedFilter.tsx
'use client';
import { useFilter } from '@/contexts';
import { X, MoreHorizontal } from 'lucide-react';
import { toast } from 'react-toastify';

// Helper function untuk mendapatkan nilai Hex dari ID preset (untuk display dot)
const getColorValue = (colorIdOrHex: string) => {
  const presets: Record<string, string> = {
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#EAB308',
    green: '#22C55E',
    blue: '#3B82F6',
    purple: '#A855F7',
    pink: '#EC4899',
    black: '#18181b',
    white: '#ffffff',
  };
  // Jika ada di preset, return hex preset. Jika tidak, asumsikan itu string Hex custom.
  return presets[colorIdOrHex] || colorIdOrHex;
};

export const AppliedFilters = () => {
  const {
    categorySlugs,
    subCategorySlugs,
    selectedTiers,
    gradientTypes,
    selectedColors, // Array warna terpilih
    toggleCategory,
    toggleSubCategory,
    toggleTier,
    toggleGradientType,
    toggleColor,
    clearAllFilters,
  } = useFilter();

  const hasActiveFilters =
    categorySlugs.length > 0 ||
    subCategorySlugs.length > 0 ||
    selectedTiers.length > 0 ||
    gradientTypes.length > 0 ||
    selectedColors.length > 0; // Cek colors

  // Hitung total filter dan batasi ke 10
  const allFilters = [
    ...selectedColors.map((c) => ({ type: 'color', value: c })),
    ...categorySlugs.map((c) => ({ type: 'category', value: c })),
    ...subCategorySlugs.map((c) => ({ type: 'subCategory', value: c })),
    ...gradientTypes.map((c) => ({ type: 'gradientType', value: c })),
    ...selectedTiers.map((c) => ({ type: 'tier', value: c })),
  ];

  const MAX_VISIBLE_FILTERS = 10;
  const totalFilters = allFilters.length;
  const hasMoreFilters = totalFilters > MAX_VISIBLE_FILTERS;

  // Tampilkan toast jika ada filter yang tersembunyi
  const handleShowMoreInfo = () => {
    toast.info(
      `Showing ${MAX_VISIBLE_FILTERS} of ${totalFilters} filters. Clear some filters to see others.`,
      { autoClose: 3000 },
    );
  };

  if (!hasActiveFilters) return null;

  // Batasi jumlah filter yang ditampilkan
  const visibleColors = selectedColors.slice(0, MAX_VISIBLE_FILTERS);
  let remaining = MAX_VISIBLE_FILTERS - visibleColors.length;

  const visibleCategories = remaining > 0 ? categorySlugs.slice(0, remaining) : [];
  remaining -= visibleCategories.length;

  const visibleSubCategories = remaining > 0 ? subCategorySlugs.slice(0, remaining) : [];
  remaining -= visibleSubCategories.length;

  const visibleGradientTypes = remaining > 0 ? gradientTypes.slice(0, remaining) : [];
  remaining -= visibleGradientTypes.length;

  const visibleTiers = remaining > 0 ? selectedTiers.slice(0, remaining) : [];

  return (
    <div className="shadow-card-sm animate-in fade-in zoom-in flex w-full flex-col items-center justify-start gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white pt-1 pb-3 shadow-sm duration-200 lg:rounded-2xl">
      <div className="inline-flex h-7 items-center justify-between self-stretch rounded-[10px] px-3 lg:h-8">
        <div className="text-[11px] font-medium text-[#3D3D3D] lg:text-xs">
          Applied Filter{' '}
          {totalFilters > 0 && <span className="text-gray-400">({totalFilters})</span>}
        </div>
        <button
          onClick={clearAllFilters}
          className="text-[11px] font-medium text-orange-600 hover:underline lg:text-xs"
        >
          Clear All
        </button>
      </div>

      <div className="flex w-full flex-wrap items-start justify-start gap-1.5 px-3 lg:gap-2">
        {/* A. COLORS (Logic Baru) */}
        {visibleColors.map((color) => (
          <div
            key={color}
            className="flex h-7 items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-100 pr-1 pl-1"
          >
            {/* Dot Warna */}
            <div
              className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-sm"
              style={{ backgroundColor: getColorValue(color) }}
            />

            {/* Text Label (Hex atau Nama) */}
            <span className="font-mono text-[10px] font-semibold text-zinc-600 uppercase">
              {color}
            </span>

            <button
              onClick={() => toggleColor(color)}
              className="rounded-full p-0.5 hover:bg-zinc-200"
            >
              <X className="h-3 w-3 text-zinc-500" />
            </button>
          </div>
        ))}

        {/* B. CATEGORIES */}
        {visibleCategories.map((slug) => (
          <div
            key={slug}
            className="flex h-7 items-center gap-1 rounded-lg bg-orange-600 pr-1 pl-2"
          >
            <span className="text-xs font-medium text-white capitalize">{slug}</span>
            <button
              onClick={() => toggleCategory(slug)}
              className="rounded-full p-0.5 hover:bg-white/20"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}

        {/* B2. SUB-CATEGORIES */}
        {visibleSubCategories.map((slug) => (
          <div
            key={slug}
            className="flex h-7 items-center gap-1 rounded-lg bg-orange-500 pr-1 pl-2"
          >
            <span className="text-xs font-medium text-white capitalize">{slug}</span>
            <button
              onClick={() => toggleSubCategory(slug)}
              className="rounded-full p-0.5 hover:bg-white/20"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}

        {/* C. GRADIENT TYPES */}
        {visibleGradientTypes.map((type) => (
          <div
            key={type}
            className="flex h-7 items-center gap-1 rounded-lg bg-purple-600 pr-1 pl-2"
          >
            <span className="text-xs font-medium text-white capitalize">{type}</span>
            <button
              onClick={() => toggleGradientType(type)}
              className="rounded-full p-0.5 hover:bg-white/20"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}

        {/* D. TIERS */}
        {visibleTiers.map((tier) => (
          <div
            key={tier}
            className="flex h-7 items-center gap-1 rounded-lg bg-orange-600 pr-1 pl-2"
          >
            <span className="text-xs font-medium text-white capitalize">
              {tier.replace('_', ' ')}
            </span>
            <button
              onClick={() => toggleTier(tier)}
              className="rounded-full p-0.5 hover:bg-white/20"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}

        {/* E. MORE INDICATOR */}
        {hasMoreFilters && (
          <button
            onClick={handleShowMoreInfo}
            className="flex h-7 items-center gap-1 rounded-lg bg-gray-200 px-2 transition-colors hover:bg-gray-300"
          >
            <MoreHorizontal className="h-3 w-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">
              +{totalFilters - MAX_VISIBLE_FILTERS}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
