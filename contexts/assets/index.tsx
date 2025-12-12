'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReactNode } from 'react';

export type ToolType = 'figma' | 'framer';
export type ContentType = 'components' | 'templates' | 'gradients' | 'designs';
export type TierType = 'free' | 'pro';
export type GradientType = 'linear' | 'radial' | 'conic';

interface FilterState {
  tool: ToolType;

  contentType: ContentType;
  categorySlugs: string[];
  subCategorySlugs: string[];
  gradientTypes: GradientType[];
  selectedColors: string[];
  selectedTiers: TierType[];
  searchQuery: string;
}

interface FilterActions {
  setTool: (t: ToolType) => void;

  setContentType: (t: ContentType) => void;

  toggleCategory: (slug: string) => void;
  setCategory: (slug: string) => void;

  toggleSubCategory: (slug: string) => void;
  setSubCategory: (slug: string) => void;

  toggleGradientType: (type: GradientType) => void;
  toggleColor: (color: string) => void;
  toggleTier: (t: TierType) => void;

  setSearchQuery: (q: string) => void;

  applySearchFilter: (params: {
    contentType?: ContentType;
    categorySlug?: string | null;
    subCategorySlug?: string | null;
    searchQuery?: string;
    clearOthers?: boolean;
  }) => void;

  clearAllFilters: () => void;
}

export const useFilterStore = create<FilterState & FilterActions>()(
  persist(
    (set) => ({
      tool: 'figma',

      contentType: 'components',
      categorySlugs: [],
      subCategorySlugs: [],
      gradientTypes: [],
      selectedColors: [],
      selectedTiers: [],
      searchQuery: '',

      setTool: (tool) => set({ tool }),

      setContentType: (contentType) =>
        set({
          contentType,
          categorySlugs: [],
          subCategorySlugs: [],
          gradientTypes: [],
          selectedColors: [],
        }),

      toggleCategory: (slug) =>
        set((state) => {
          if (slug === 'all') return { categorySlugs: [] };
          const exists = state.categorySlugs.includes(slug);
          return {
            categorySlugs: exists
              ? state.categorySlugs.filter((s) => s !== slug)
              : [...state.categorySlugs, slug],
          };
        }),

      setCategory: (slug) => set({ categorySlugs: [slug] }),

      toggleSubCategory: (slug) =>
        set((state) => {
          const exists = state.subCategorySlugs.includes(slug);
          return {
            subCategorySlugs: exists
              ? state.subCategorySlugs.filter((s) => s !== slug)
              : [...state.subCategorySlugs, slug],
          };
        }),

      setSubCategory: (slug) => set({ subCategorySlugs: [slug] }),

      toggleGradientType: (type) =>
        set((state) => {
          const exists = state.gradientTypes.includes(type);
          return {
            gradientTypes: exists
              ? state.gradientTypes.filter((t) => t !== type)
              : [...state.gradientTypes, type],
          };
        }),

      toggleColor: (color) =>
        set((state) => {
          const exists = state.selectedColors.includes(color);
          return {
            selectedColors: exists
              ? state.selectedColors.filter((c) => c !== color)
              : [...state.selectedColors, color],
          };
        }),

      toggleTier: (tier) =>
        set((state) => {
          const exists = state.selectedTiers.includes(tier);
          return {
            selectedTiers: exists
              ? state.selectedTiers.filter((t) => t !== tier)
              : [...state.selectedTiers, tier],
          };
        }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      applySearchFilter: ({
        contentType,
        categorySlug,
        subCategorySlug,
        searchQuery,
        clearOthers,
      }) =>
        set((state) => {
          const newState: Partial<FilterState> = {};

          if (clearOthers) {
            newState.categorySlugs = [];
            newState.subCategorySlugs = [];
            newState.gradientTypes = [];
            newState.selectedColors = [];
            newState.selectedTiers = [];
          }

          if (contentType) newState.contentType = contentType;
          if (categorySlug !== undefined)
            newState.categorySlugs = categorySlug ? [categorySlug] : [];
          if (subCategorySlug !== undefined)
            newState.subCategorySlugs = subCategorySlug
              ? [subCategorySlug]
              : [];
          if (searchQuery !== undefined) newState.searchQuery = searchQuery;

          return newState;
        }),

      clearAllFilters: () =>
        set({
          categorySlugs: [],
          subCategorySlugs: [],
          gradientTypes: [],
          selectedColors: [],
          selectedTiers: [],
          searchQuery: '',
        }),
    }),
    {
      name: 'assets-filter-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Backward compatibility hook
export const useFilter = useFilterStore;

// Dummy Provider for backward compatibility (in case it's used elsewhere)
export const FilterProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};
