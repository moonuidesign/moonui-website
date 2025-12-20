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
  const {
    isFilterOpen,
    setFilterOpen,
    tool,
    contentType,
    applySearchFilter,
    _hasHydrated,
  } = useFilter();

  const [data, setData] = useState<any>({
    allItems: [],
    totalCount: 0,
    componentCategories: { all: [], figma: [], framer: [] },
    templateCategories: { all: [], figma: [], framer: [] },
    gradientCategories: { all: [], figma: [], framer: [] },
    designCategories: { all: [], figma: [], framer: [] },
  });

  useEffect(() => {
    if (query) {
      applySearchFilter({ searchQuery: query });
    } else {
      const currentStoreQuery = useFilterStore.getState().searchQuery;
      if (currentStoreQuery !== '') {
        applySearchFilter({ searchQuery: '' });
      }
    }
  }, [query, applySearchFilter]);

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
    <div className="min-h-screen font-['Inter']">
      <MobileFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setFilterOpen(false)}
        gradientCategories={
          data.gradientCategories[tool] || data.gradientCategories.all || []
        }
        componentCategories={
          data.componentCategories[tool] || data.componentCategories.all || []
        }
        templateCategories={
          data.templateCategories[tool] || data.templateCategories.all || []
        }
        designCategories={
          data.designCategories[tool] || data.designCategories.all || []
        }
      />

      <div className="max-w-7xl w-7xl mx-auto px-4 md:px-6 py-6 flex gap-8 relative">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-6">
            <div className="mb-6 pl-1">
              <h1 className="text-[#3D3D3D] text-xl font-semibold font-['Plus_Jakarta_Sans']">
                Resources
              </h1>
            </div>
            <SidebarFilter
              gradientCategories={
                data.gradientCategories[tool] ||
                data.gradientCategories.all ||
                []
              }
              componentCategories={
                data.componentCategories[tool] ||
                data.componentCategories.all ||
                []
              }
              templateCategories={
                data.templateCategories[tool] ||
                data.templateCategories.all ||
                []
              }
              designCategories={
                data.designCategories[tool] || data.designCategories.all || []
              }
            />
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="w-full ">
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
