'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Content from '@/components/assets/content';
import NavbarFilter from '@/components/assets/navbar';
import SidebarFilter from '@/components/assets/sidebar';
import MobileFilterDrawer from '@/components/assets/mobile-filter-drawer';
import { getAssetsData } from '@/server-action/getAssetsData';
import { useFilter, useFilterStore } from '@/contexts';
import { CardGridSkeleton } from '@/components/skeletons/card-skeleton';
import { AssetsPageSkeleton } from '@/components/skeletons/assets-page-skeleton';
import { useSearchParams } from 'next/navigation';
function AssetsPageContent() {
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { isFilterOpen, setFilterOpen, tool, contentType, applySearchFilter, _hasHydrated } =
    useFilter();

  const [data, setData] = useState<any>({
    allItems: [],
    totalCount: 0,
    componentCategories: { all: [], figma: [], framer: [] },
    templateCategories: { all: [], figma: [], framer: [] },
    gradientCategories: { all: [], figma: [], framer: [] },
    designCategories: { all: [], figma: [], framer: [] },
  });

  const typeParam = searchParams.get('type');

  useEffect(() => {
    // Determine which contentType to use from URL or keep existing if not present
    let nextContentType = undefined;
    if (typeParam && ['components', 'templates', 'gradients', 'designs'].includes(typeParam)) {
      nextContentType = typeParam as any;
    }

    if (query || nextContentType) {
      applySearchFilter({
        searchQuery: query,
        contentType: nextContentType,
        clearOthers: !!nextContentType,
      });
    } else {
      const currentStoreQuery = useFilterStore.getState().searchQuery;
      if (currentStoreQuery !== '') {
        applySearchFilter({ searchQuery: '' });
      }
    }
  }, [query, typeParam, applySearchFilter]);

  useEffect(() => {
    if (!_hasHydrated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getAssetsData({
          contentType,
          tool,
          searchQuery: query,
        });

        setData(result as any);
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tool, contentType, _hasHydrated, query]);

  if (!_hasHydrated) {
    return <AssetsPageSkeleton />;
  }

  return (
    <div className="min-fit font-['Inter']">
      <MobileFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setFilterOpen(false)}
        gradientCategories={data.gradientCategories[tool] || data.gradientCategories.all || []}
        componentCategories={data.componentCategories[tool] || data.componentCategories.all || []}
        templateCategories={data.templateCategories[tool] || data.templateCategories.all || []}
        designCategories={data.designCategories[tool] || data.designCategories.all || []}
      />

      <div className="relative z-[800] mx-auto -mt-[69px] flex max-w-3xl gap-4 rounded-t-[39px] bg-[#E7E7E7] px-4 py-6 pt-14 md:z-0 md:mt-[30px] md:w-full md:max-w-5xl md:rounded-none md:bg-none md:px-4 md:pt-0 lg:w-7xl lg:max-w-7xl lg:gap-8 lg:px-6">
        {/* Sidebar - Responsive width for tablet and desktop */}
        <div className="hidden flex-shrink-0 md:block md:w-52 lg:w-64">
          <div className="sticky top-6">
            <div className="mb-4 pl-1 lg:mb-6">
              <h1 className="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#3D3D3D] lg:text-xl">
                Resources
              </h1>
            </div>
            <SidebarFilter
              gradientCategories={
                data.gradientCategories[tool] || data.gradientCategories.all || []
              }
              componentCategories={
                data.componentCategories[tool] || data.componentCategories.all || []
              }
              templateCategories={
                data.templateCategories[tool] || data.templateCategories.all || []
              }
              designCategories={data.designCategories[tool] || data.designCategories.all || []}
            />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="w-full">
            <NavbarFilter onFilterClick={() => setFilterOpen(true)} />
            <div className="pb-20">
              {loading ? (
                <CardGridSkeleton />
              ) : (
                <Content
                  key={`${contentType}-${tool}-${query}`}
                  initialItems={data.allItems}
                  initialTotalCount={data.totalCount}
                />
              )}
            </div>
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
