'use client';

import React, { useMemo, useCallback } from 'react'; // Import useCallback
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
}

export default function SidebarFilter({
  componentCategories,
  templateCategories,
  gradientCategories,
  designCategories = [],
  className,
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

  return (
    <aside
      className={cn(
        'w-64 flex flex-col gap-4 sticky top-24 h-fit pb-10',
        className,
      )}
    >
      {(contentType === 'components' || contentType === 'templates') && (
        <PlatformSwitcher currentTool={tool} onChange={setTool} />
      )}
      <AppliedFilters />
      <TierFilter />
      <ColorFilter />
      <GradientTypeFilter />
      <CategoryFilter
        title={currentTitle}
        categories={currentCategories}
        activeSlugs={categorySlugs}
        activeSubSlugs={subCategorySlugs}
        onToggle={toggleCategory}
        onToggleSub={toggleSubCategory}
      />
    </aside>
  );
}
