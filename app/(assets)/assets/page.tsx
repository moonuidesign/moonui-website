'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { getInfiniteData, getOverviewData } from '@/server-action/getAssets2Data';
import { useFilter, useFilterStore } from '@/contexts';
import { CardGridSkeleton } from '@/components/skeletons/card-skeleton';
import { AssetsPageSkeleton } from '@/components/skeletons/assets-page-skeleton';
import { useSearchParams } from 'next/navigation';
import FilteredContent from '../../../components/assets-v2/filtered-content';
import GroupedContent from '../../../components/assets-v2/grouped-content';
import SidebarWrapper from '../../../components/assets-v2/_components/sidebar-wrapper';
import { FileBox, LayoutGrid, Palette, PenTool, SlidersHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/libs/utils';

function AssetsPageContent() {
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const query = useFilterStore((state) => state.searchQuery);
  const {
    tool,
    contentType,
    categorySlugs,
    subCategorySlugs,
    _hasHydrated,
    selectedTiers,
    setSortBy,
    setFilterOpen,
    setContentType,
    sortBy,
  } = useFilter();

  const [data, setData] = useState<any>({
    allItems: [],
    totalCount: 0,
    groupedAssets: {},
  });

  const urlQ = searchParams.get('q');
  useEffect(() => {
    if (urlQ !== null && urlQ !== query) {
      useFilterStore.getState().setSearchQuery(urlQ);
    }
  }, [urlQ]);

  const activePill = 'bg-orange-600 text-white shadow-card-sm border-transparent';
  const inactivePill = 'bg-white text-[#3D3D3D] border-gray-200 hover:bg-gray-50';

  const isGroupedMode = (categorySlugs.length === 0 || categorySlugs.includes('all')) && !query;

  useEffect(() => {
    if (!_hasHydrated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        let fetchedGroupedAssets = {};
        let fetchedAllItems = [];
        let fetchedTotalCount = 0;
        const currentQuery = useFilterStore.getState().searchQuery;

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
            currentQuery,
          );
          fetchedAllItems = res.items;
          fetchedTotalCount = res.totalCount;
        }
        setData({
          groupedAssets: fetchedGroupedAssets,
          allItems: fetchedAllItems,
          totalCount: fetchedTotalCount,
        });
      } catch (error) {
        console.error('Failed to fetch assets content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tool, contentType, _hasHydrated, query, sortBy, categorySlugs, isGroupedMode, selectedTiers]);

  if (!_hasHydrated) {
    return <AssetsPageSkeleton />;
  }

  // Restore the Grid Structure: Sidebar | Content
  return (
    <div className="flex min-h-[85vh] gap-4 lg:gap-8">
      {/* Sidebar Column */}
      <div className="hidden shrink-0 md:block md:w-52 lg:w-64">
        <div className="sticky top-24 flex flex-col gap-4 lg:gap-8">
          <div className="flex flex-col gap-2 lg:gap-4">
            <h1 className="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#3D3D3D] lg:text-[24px]">
              What’s new?
            </h1>
            <p className="font-['Inter'] text-sm font-medium text-[#3D3D3D]">
              Filter your asset below
            </p>
          </div>
          {/* Sidebar Filter Wrapper */}
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-gray-100" />}>
            <SidebarWrapper />
          </Suspense>
        </div>
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col gap-4 lg:gap-8">
        <div className="hidden flex-col gap-2 md:flex lg:gap-4">
          <h1 className="relative font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#3D3D3D] capitalize lg:text-[24px]">
            <span className="absolute top-1/2 left-[250px] h-[1.5px] -translate-y-1/2 transform bg-[#D3D3D3] md:w-[53%] lg:w-[75%]">
              <div className="absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]"></div>
              <div className="absolute top-1/2 right-0 h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]"></div>
            </span>
            Assets {contentType}
          </h1>
          <p className="font-['Plus_Jakarta_Sans'] text-sm font-medium text-[#3D3D3D]">
            Find the best section you need for enhance your projects.
          </p>
        </div>
        <div>
          <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
            <div className="scrollbar-hide flex w-full flex-row items-center gap-2 overflow-x-auto px-4 pb-2 md:w-auto md:flex-wrap md:overflow-visible md:pb-0 md:pl-0">
              <button
                onClick={() => setContentType('components')}
                className={cn(
                  'flex h-9 items-center gap-2 rounded-full border border-gray-200 px-4 text-sm font-medium shadow-sm transition-all',
                  contentType === 'components' ? activePill : inactivePill,
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Components
              </button>

              <button
                onClick={() => setContentType('templates')}
                className={cn(
                  'flex h-9 items-center gap-2 rounded-full border border-gray-200 px-4 text-sm font-medium shadow-sm transition-all',
                  contentType === 'templates' ? activePill : inactivePill,
                )}
              >
                <FileBox className="h-4 w-4" />
                Templates
              </button>

              <button
                onClick={() => setContentType('designs')}
                className={cn(
                  'flex h-9 items-center gap-2 rounded-full border border-gray-200 px-4 text-sm font-medium shadow-sm transition-all',
                  contentType === 'designs' ? activePill : inactivePill,
                )}
              >
                <PenTool className="h-4 w-4" />
                Designs
              </button>

              <button
                onClick={() => setContentType('gradients')}
                className={cn(
                  'flex h-9 items-center gap-2 rounded-full border border-gray-200 px-4 text-sm font-medium shadow-sm transition-all',
                  contentType === 'gradients' ? activePill : inactivePill,
                )}
              >
                <Palette className="h-4 w-4" />
                Gradients
              </button>
            </div>
            <div className="flex w-full items-center justify-between gap-2 px-4 md:w-auto md:px-0">
              <button
                onClick={() => setFilterOpen(true)}
                className="flex h-10 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 shadow-sm transition-all md:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
              </button>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={(v: 'recent' | 'popular') => setSortBy(v)}>
                <SelectTrigger className="h-10 w-[140px] rounded-full border-gray-200 bg-white shadow-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Right Controls */}
        <div className="px-4 md:px-0">
          <div className="h-fit w-full rounded-2xl bg-[#F7F7F7] p-4 md:h-fit md:p-8">
            {loading ? (
              <CardGridSkeleton />
            ) : isGroupedMode ? (
              <GroupedContent
                categories={Object.keys(data.groupedAssets).map((name) => ({
                  id: name,
                  name,
                  slug: name.toLowerCase(),
                  count: 0,
                }))}
                groupedAssets={data.groupedAssets || {}}
                onCategorySelect={(slug) => useFilterStore.getState().setCategory(slug)}
              />
            ) : (
              <FilteredContent
                key={`${contentType}-${tool}-${query}-${sortBy}-${categorySlugs.join('-')}`}
                initialItems={data.allItems}
                initialTotalCount={data.totalCount}
                sortBy={sortBy}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssetsPage() {
  return (
    <Suspense fallback={<AssetsPageSkeleton />}>
      <AssetsPageContent />
    </Suspense>
  );
}
