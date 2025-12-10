// context/FilterContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export type ToolType = 'figma' | 'framer';
export type ContentType = 'components' | 'templates' | 'gradients' | 'designs';
export type PlatformType =
  | 'web'
  | 'ios'
  | 'android'
  | 'desktop'
  | 'cross_platform'
  | 'all';
export type TierType = 'free' | 'pro' | 'pro_plus';
export type GradientType = 'linear' | 'radial' | 'conic';

interface FilterState {
  tool: ToolType;
  platform: PlatformType;
  contentType: ContentType;
  categorySlugs: string[];
  gradientTypes: GradientType[];
  selectedColors: string[];
  selectedTiers: TierType[];
  searchQuery: string;
}

interface FilterContextType extends FilterState {
  setTool: (t: ToolType) => void;
  setPlatform: (p: PlatformType) => void;
  setContentType: (t: ContentType) => void;

  toggleCategory: (slug: string) => void;
  toggleGradientType: (type: GradientType) => void;
  toggleColor: (color: string) => void;
  toggleTier: (t: TierType) => void;

  setSearchQuery: (q: string) => void;
  clearAllFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tool, setTool] = useState<ToolType>('figma');
  const [platform, setPlatform] = useState<PlatformType>('web');
  const [contentType, setContentType] = useState<ContentType>('components');
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [gradientTypes, setGradientTypes] = useState<GradientType[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<TierType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Actions
  const handleSetContentType = (type: ContentType) => {
    setContentType(type);
    setCategorySlugs([]);
    setGradientTypes([]);
    setSelectedColors([]);
  };

  const toggleCategory = (slug: string) => {
    if (slug === 'all') {
      setCategorySlugs([]);
      return;
    }
    setCategorySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const toggleGradientType = (type: GradientType) => {
    setGradientTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const toggleTier = (tier: TierType) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier],
    );
  };

  const clearAllFilters = () => {
    setCategorySlugs([]);
    setGradientTypes([]);
    setSelectedColors([]);
    setSelectedTiers([]);
    setSearchQuery('');

    // Clear URL params
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('type');
    newParams.delete('category');
    newParams.delete('q');
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  // --- INITIALIZATION & EVENTS ---
  useEffect(() => {
    // 1. Priority: Check URL Search Params
    const typeParam = searchParams.get('type') as ContentType;
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('q');

    let initializedFromUrl = false;

    if (
      typeParam &&
      ['components', 'templates', 'gradients', 'designs'].includes(typeParam)
    ) {
      setContentType(typeParam);
      initializedFromUrl = true;
    }

    if (categoryParam) {
      setCategorySlugs([categoryParam]); // Support single category via URL for now
      initializedFromUrl = true;
    }

    if (searchParam) {
      setSearchQuery(searchParam);
      initializedFromUrl = true;
    }

    // 2. If no URL params, check Local Storage (fallback)
    if (!initializedFromUrl) {
      try {
        const savedFilters = localStorage.getItem('ASSET_FILTERS');
        if (savedFilters) {
          const parsed = JSON.parse(savedFilters);
          if (parsed.contentType) setContentType(parsed.contentType);
          if (parsed.categorySlugs) setCategorySlugs(parsed.categorySlugs);
          if (parsed.searchQuery) setSearchQuery(parsed.searchQuery);

          // Clear storage after applying to avoid sticking
          localStorage.removeItem('ASSET_FILTERS');
        }
      } catch (error) {
        console.error('Failed to parse filters from local storage:', error);
      }
    }

    // 3. Listen for Custom Event (from SearchCommand)
    const handleFilterUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { contentType, categorySlug, searchQuery, clearOthers } =
        customEvent.detail || {};

      if (clearOthers) {
        setCategorySlugs([]);
        setGradientTypes([]);
        setSelectedColors([]);
        setSelectedTiers([]);
      }

      if (contentType) setContentType(contentType);

      if (categorySlug) {
        setCategorySlugs([categorySlug]);
      }

      if (typeof searchQuery === 'string') {
        setSearchQuery(searchQuery);
      }
    };

    window.addEventListener('TRIGGER_FILTER_UPDATE', handleFilterUpdate);
    return () => {
      window.removeEventListener('TRIGGER_FILTER_UPDATE', handleFilterUpdate);
    };
  }, [searchParams]); // Re-run if URL changes

  return (
    <FilterContext.Provider
      value={{
        tool,
        platform,
        contentType,
        categorySlugs,
        gradientTypes,
        selectedColors,
        selectedTiers,
        searchQuery,
        setTool,
        setPlatform,
        setContentType: handleSetContentType,
        toggleCategory,
        toggleGradientType,
        toggleColor,
        toggleTier,
        setSearchQuery,
        clearAllFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error('useFilter error');
  return context;
};
