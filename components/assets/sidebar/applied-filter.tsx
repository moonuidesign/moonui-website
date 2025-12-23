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
      { autoClose: 3000 }
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
    <div className="w-full pt-1 pb-3 lg:pb-4 bg-white rounded-xl lg:rounded-2xl shadow-card-sm flex flex-col justify-start items-center gap-2 overflow-hidden mb-3 lg:mb-4 animate-in fade-in zoom-in duration-200">
      <div className="self-stretch h-7 lg:h-8 px-3 rounded-[10px] inline-flex justify-between items-center">
        <div className="text-[#3D3D3D] text-[11px] lg:text-xs font-medium">
          Applied Filter {totalFilters > 0 && <span className="text-gray-400">({totalFilters})</span>}
        </div>
        <button
          onClick={clearAllFilters}
          className="text-orange-600 text-[11px] lg:text-xs font-medium hover:underline"
        >
          Clear All
        </button>
      </div>

      <div className="w-full px-3 flex flex-wrap justify-start items-start gap-1.5 lg:gap-2">
        {/* A. COLORS (Logic Baru) */}
        {visibleColors.map((color) => (
          <div
            key={color}
            className="h-7 pl-1 pr-1 bg-zinc-100 border border-zinc-200 rounded-lg flex items-center gap-1.5"
          >
            {/* Dot Warna */}
            <div
              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-sm"
              style={{ backgroundColor: getColorValue(color) }}
            />

            {/* Text Label (Hex atau Nama) */}
            <span className="text-zinc-600 text-[10px] font-semibold uppercase font-mono">
              {color}
            </span>

            <button
              onClick={() => toggleColor(color)}
              className="hover:bg-zinc-200 rounded-full p-0.5"
            >
              <X className="w-3 h-3 text-zinc-500" />
            </button>
          </div>
        ))}

        {/* B. CATEGORIES */}
        {visibleCategories.map((slug) => (
          <div
            key={slug}
            className="h-7 pl-2 pr-1 bg-orange-600 rounded-lg flex items-center gap-1"
          >
            <span className="text-white text-xs font-medium capitalize">
              {slug}
            </span>
            <button
              onClick={() => toggleCategory(slug)}
              className="hover:bg-white/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {/* B2. SUB-CATEGORIES */}
        {visibleSubCategories.map((slug) => (
          <div
            key={slug}
            className="h-7 pl-2 pr-1 bg-orange-500 rounded-lg flex items-center gap-1"
          >
            <span className="text-white text-xs font-medium capitalize">
              {slug}
            </span>
            <button
              onClick={() => toggleSubCategory(slug)}
              className="hover:bg-white/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {/* C. GRADIENT TYPES */}
        {visibleGradientTypes.map((type) => (
          <div
            key={type}
            className="h-7 pl-2 pr-1 bg-purple-600 rounded-lg flex items-center gap-1"
          >
            <span className="text-white text-xs font-medium capitalize">
              {type}
            </span>
            <button
              onClick={() => toggleGradientType(type)}
              className="hover:bg-white/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {/* D. TIERS */}
        {visibleTiers.map((tier) => (
          <div
            key={tier}
            className="h-7 pl-2 pr-1 bg-orange-600 rounded-lg flex items-center gap-1"
          >
            <span className="text-white text-xs font-medium capitalize">
              {tier.replace('_', ' ')}
            </span>
            <button
              onClick={() => toggleTier(tier)}
              className="hover:bg-white/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {/* E. MORE INDICATOR */}
        {hasMoreFilters && (
          <button
            onClick={handleShowMoreInfo}
            className="h-7 px-2 bg-gray-200 rounded-lg flex items-center gap-1 hover:bg-gray-300 transition-colors"
          >
            <MoreHorizontal className="w-3 h-3 text-gray-600" />
            <span className="text-gray-600 text-xs font-medium">
              +{totalFilters - MAX_VISIBLE_FILTERS}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
