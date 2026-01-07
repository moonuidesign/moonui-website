'use client';

import React from 'react'; // Import useCallback
import { useFilter } from '@/contexts';
import { NavCategoryItem } from '@/types/category';
import { cn } from '@/libs/utils';

// Components
import { AppliedFilters } from './applied-filter';
import { TierFilter } from './tier-filter';
import { ColorFilter } from './color-filter';
import { GradientTypeFilter } from './gradient-type-filter';
import { CategoryFilter } from './category-filter';
import { PlatformSwitcher } from './platform-switcher';
import { GoProCard } from './go-pro-card';
import { useSession } from 'next-auth/react';

// Re-exports
export * from './applied-filter';
export * from './category-filter';
export * from './color-filter';
export * from './go-pro-card';
export * from './gradient-type-filter';
export * from './tier-filter';
export * from './platform-switcher';

export interface SidebarFilterProps {
  componentCategories: NavCategoryItem[];
  templateCategories: NavCategoryItem[];
  gradientCategories: NavCategoryItem[];
  designCategories?: NavCategoryItem[];
  className?: string;
  onToggleCategory?: (slug: string) => void;
  onToggleSubCategory?: (slug: string) => void;
}

export default function SidebarFilter({
  componentCategories,
  templateCategories,
  gradientCategories,
  designCategories = [],
  className,
  onToggleCategory,
  onToggleSubCategory,
}: SidebarFilterProps) {
  const {
    tool,
    setTool,
    contentType,
    categorySlugs,
    subCategorySlugs,
    toggleCategory,
    toggleSubCategory,
  } = useFilter();
  const session = useSession();
  let currentCategories: NavCategoryItem[] = [];
  let currentTitle = '';

  switch (contentType) {
    case 'templates':
      currentCategories = templateCategories;
      currentTitle = 'Template Categories';
      break;
    case 'gradients':
      currentCategories = gradientCategories;
      currentTitle = 'Gradient Categories';
      break;
    case 'designs':
      currentCategories = designCategories;
      currentTitle = 'Design Categories';
      break;
    case 'components':
    default:
      currentCategories = componentCategories;
      currentTitle = 'Components';
      break;
  }

  const handleCategoryToggle = onToggleCategory || toggleCategory;
  const handleSubCategoryToggle = onToggleSubCategory || toggleSubCategory;

  return (
    <aside className={cn('sticky top-24 flex h-fit flex-col items-center gap-6', className)}>
      <div className="flex h-full w-full flex-col gap-2 lg:gap-2">
        {(contentType === 'components' || contentType === 'templates') && (
          <PlatformSwitcher currentTool={tool} onChange={setTool} />
        )}
        <AppliedFilters />
        <ColorFilter />
        <GradientTypeFilter />
        <CategoryFilter
          title={currentTitle}
          categories={currentCategories}
          activeSlugs={categorySlugs}
          activeSubSlugs={subCategorySlugs}
          onToggle={handleCategoryToggle}
          onToggleSub={handleSubCategoryToggle}
        />
        <TierFilter />
      </div>

      {!session.data?.user && <GoProCard />}
    </aside>
  );
}
