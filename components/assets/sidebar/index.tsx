'use client';

import React, { useMemo } from 'react';
import { useFilter } from '@/contexts';
import { NavCategoryItem } from '@/types/category';

// Components
import { PlatformSwitcher } from './platform-switcher';
import { AppliedFilters } from './applied-filter';
import { TierFilter } from './tier-filter';
import { ColorFilter } from './color-filter';
import { GradientTypeFilter } from './gradient-type-filter';
import { CategoryFilter } from './category-filter';
import { GoProCard } from './go-pro-card';

// Re-exports
export * from './applied-filter';
export * from './category-filter';
export * from './color-filter';
export * from './go-pro-card';
export * from './gradient-type-filter';
export * from './platform-switcher';
export * from './tier-filter';

interface SidebarFilterProps {
  componentCategories: NavCategoryItem[];
  templateCategories: NavCategoryItem[];
  gradientCategories: NavCategoryItem[];
  designCategories?: NavCategoryItem[];
  items?: any[];
}

export default function SidebarFilter({
  componentCategories,
  templateCategories,
  gradientCategories,
  designCategories = [],
  items = [],
}: SidebarFilterProps) {
  const {
    tool,
    setTool,
    contentType,
    categorySlugs,
    subCategorySlugs, // Added from store
    toggleCategory,
    toggleSubCategory, // Added from store
  } = useFilter();

  // --- LOGIKA DINAMIS KATEGORI ---
  
  // Helper to deep clone and update counts
  const getDynamicCategories = (originalCategories: NavCategoryItem[]) => {
    if (!items || items.length === 0) return originalCategories;

    // 1. Deep Clone
    const cloned: NavCategoryItem[] = JSON.parse(JSON.stringify(originalCategories));
    
    // 2. Count Map
    const counts = new Map<string, number>();

    // 3. Filter Items matching current Context
    items.forEach((item) => {
      // Check Content Type
      if (item.type !== contentType) return;

      // Check Tool (only for components)
      if (contentType === 'components' && item.typeContent && item.typeContent !== tool) {
        return;
      }

      // Count by Category Name (slug matches name in this system)
      if (item.categorySlug) {
        counts.set(item.categorySlug, (counts.get(item.categorySlug) || 0) + 1);
      }
    });

    // 4. Update Tree recursively
    const updateNode = (node: NavCategoryItem): number => {
      let nodeCount = counts.get(node.slug) || 0; // Direct count

      if (node.children && node.children.length > 0) {
        let childrenCount = 0;
        node.children.forEach((child) => {
          childrenCount += updateNode(child);
        });
        // Add children count to parent? Usually yes for filters
        nodeCount += childrenCount;
      }
      
      node.count = nodeCount;
      return nodeCount;
    };

    cloned.forEach(updateNode);
    return cloned;
  };

  const dynamicComponentCategories = useMemo(
    () => getDynamicCategories(componentCategories),
    [componentCategories, items, contentType, tool]
  );

  const dynamicTemplateCategories = useMemo(
    () => getDynamicCategories(templateCategories),
    [templateCategories, items, contentType, tool]
  );

  const dynamicGradientCategories = useMemo(
    () => getDynamicCategories(gradientCategories),
    [gradientCategories, items, contentType, tool]
  );

  const dynamicDesignCategories = useMemo(
    () => getDynamicCategories(designCategories),
    [designCategories, items, contentType, tool]
  );

  let currentCategories: NavCategoryItem[] = [];
  let currentTitle = '';

  switch (contentType) {
    case 'templates':
      currentCategories = dynamicTemplateCategories;
      currentTitle = 'Template Categories';
      break;
    case 'gradients':
      currentCategories = dynamicGradientCategories;
      currentTitle = 'Gradient Categories';
      break;
    case 'designs':
      currentCategories = dynamicDesignCategories;
      currentTitle = 'Design Categories';
      break;
    case 'components':
    default:
      currentCategories = dynamicComponentCategories;
      currentTitle = `${tool === 'figma' ? 'Figma' : 'Framer'} Components`;
      break;
  }

  return (
    <aside className="w-64 flex flex-col gap-4 sticky top-24 h-fit pb-10">
      {/* 1. SWITCHER FIGMA / FRAMER 
         Disembunyikan jika sedang di mode 'gradients' atau 'designs'
      */}
      {contentType !== 'gradients' && contentType !== 'designs' && (
        <PlatformSwitcher currentTool={tool} onChange={setTool} />
      )}

      {/* 2. Applied Filters */}
      <AppliedFilters />

      {/* 3. Tier Filter (Free/Pro) */}
      <TierFilter />

      {/* 4. Color Picker (KHUSUS GRADIENT) */}
      <ColorFilter />

      {/* 5. Gradient Type Filter (Linear/Radial - KHUSUS GRADIENT) */}
      <GradientTypeFilter />

      {/* 6. Dynamic Category Filter */}
      <CategoryFilter
        title={currentTitle}
        categories={currentCategories}
        activeSlugs={categorySlugs}
        activeSubSlugs={subCategorySlugs} // Pass sub-category state
        onToggle={toggleCategory}
        onToggleSub={toggleSubCategory} // Pass sub-category toggle
      />

      <div className="mt-4">
        <GoProCard />
      </div>
    </aside>
  );
}