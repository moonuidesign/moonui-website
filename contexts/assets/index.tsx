'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { ReactNode } from 'react';
import { getInfiniteData, getOverviewData } from '@/server-action/getAssets2Data';

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
  sortBy: 'recent' | 'popular';
  isFilterOpen: boolean;
  _hasHydrated: boolean;

  // Data State
  data: {
    groupedAssets: any;
    allItems: any[];
    totalCount: number;
  };
  isLoading: boolean;
  error: any;
  fetchId: number; // For race condition handling
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
  setSortBy: (s: 'recent' | 'popular') => void;
  setFilterOpen: (open: boolean) => void;
  setHasHydrated: (state: boolean) => void;

  applySearchFilter: (params: {
    contentType?: ContentType;
    categorySlug?: string | null;
    subCategorySlug?: string | null;
    searchQuery?: string;
    clearOthers?: boolean;
  }) => void;

  clearAllFilters: () => void;

  // Data Action
  refetchAssets: () => Promise<void>;
}

const storage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};

export const useFilterStore = create<FilterState & FilterActions>()(
  persist(
    (set, get) => ({
      tool: 'figma',

      contentType: 'components',
      categorySlugs: [],
      subCategorySlugs: [],
      gradientTypes: [],
      selectedColors: [],
      selectedTiers: [],
      searchQuery: '',
      sortBy: 'recent',
      isFilterOpen: false,
      _hasHydrated: false,

      // Initial Data State
      data: {
        groupedAssets: {},
        allItems: [],
        totalCount: 0,
      },
      isLoading: false,
      error: null,
      fetchId: 0,

      setTool: (tool) => set({ tool }),
      setFilterOpen: (isFilterOpen) => set({ isFilterOpen }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),

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
          if (slug === 'all') return { categorySlugs: [], subCategorySlugs: [] };
          const exists = state.categorySlugs.includes(slug);
          return {
            categorySlugs: exists
              ? state.categorySlugs.filter((s) => s !== slug)
              : [...state.categorySlugs, slug],
            // Reset subcategories when toggling categories to prevent invalid states
            subCategorySlugs: [],
          };
        }),

      // Updated: Reset subcategories when setting a new category
      setCategory: (slug) => set({ categorySlugs: [slug], subCategorySlugs: [] }),

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
      setSortBy: (sortBy) => set({ sortBy }),

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
            newState.subCategorySlugs = subCategorySlug ? [subCategorySlug] : [];
          if (searchQuery !== undefined) newState.searchQuery = searchQuery;

          return newState;
        }),

      clearAllFilters: () => {
        localStorage.removeItem('assets-filter-storage');
        set({
          categorySlugs: [],
          subCategorySlugs: [],
          gradientTypes: [],
          selectedColors: [],
          selectedTiers: [],
          searchQuery: '',
          sortBy: 'recent',
        });
      },

      refetchAssets: async () => {
        const state = get();
        // Increment fetchId to invalidate previous requests
        const currentFetchId = state.fetchId + 1;
        set({ isLoading: true, fetchId: currentFetchId, error: null });

        try {
          const { contentType, categorySlugs, searchQuery, selectedTiers, tool, sortBy } = state;
          const isGroupedMode =
            (categorySlugs.length === 0 || categorySlugs.includes('all')) && !searchQuery;

          let fetchedGroupedAssets = {};
          let fetchedAllItems = [];
          let fetchedTotalCount = 0;

          if (isGroupedMode) {
            fetchedGroupedAssets = await getOverviewData(contentType, selectedTiers, tool);
          } else {
            const categorySlug = categorySlugs[0] || 'all';
            const res = await getInfiniteData(
              categorySlug,
              12,
              0,
              contentType,
              selectedTiers,
              tool,
              sortBy,
              searchQuery,
            );
            fetchedAllItems = res.items;
            fetchedTotalCount = res.totalCount;
          }

          // Check if this is still the latest request
          if (get().fetchId === currentFetchId) {
            set({
              data: {
                groupedAssets: fetchedGroupedAssets,
                allItems: fetchedAllItems,
                totalCount: fetchedTotalCount,
              },
              isLoading: false,
            });
          }
        } catch (error) {
          if (get().fetchId === currentFetchId) {
            console.error('Failed to fetch assets:', error);
            set({ error, isLoading: false });
          }
        }
      },
    }),
    {
      name: 'assets-filter-storage',
      storage: createJSONStorage(() => storage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      // BAGIAN PENTING: Tambahkan 'searchQuery', 'data', 'isLoading', 'error', 'fetchId' ke dalam filter blacklist
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) =>
              // Jangan simpan state data fetching dan transient items di localStorage
              ![
                'isFilterOpen',
                '_hasHydrated',
                'searchQuery',
                'data',
                'isLoading',
                'error',
                'fetchId',
              ].includes(key),
          ),
        ),
    },
  ),
);

// Backward compatibility hook
export const useFilter = useFilterStore;

// Dummy Provider for backward compatibility (in case it's used elsewhere)
export const FilterProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};
