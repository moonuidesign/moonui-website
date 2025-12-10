'use client';
import { useFilter } from '@/contexts';
import { NavCategoryItem } from '@/types/category';
import React from 'react';
import { PlatformSwitcher } from './platform-switcher';
import { AppliedFilters } from './applied-filter';
import { TierFilter } from './tier-filter';
import { ColorFilter } from './color-filter';
import { GradientTypeFilter } from './gradient-type-filter';
import { CategoryFilter } from './category-filter';
import { GoProCard } from './go-pro-card';

interface SidebarProps {
  componentCategories: NavCategoryItem[];
  templateCategories: NavCategoryItem[];
  gradientCategories: NavCategoryItem[];
  designCategories?: NavCategoryItem[]; // Added designCategories
}

export const Sidebar: React.FC<SidebarProps> = ({
  componentCategories,
  templateCategories,
  gradientCategories,
  designCategories = [],
}) => {
  const { tool, setTool, contentType, categorySlugs, toggleCategory } =
    useFilter();

  // --- LOGIKA DINAMIS KATEGORI ---
  let currentCategories: NavCategoryItem[] = [];
  let currentTitle = '';

  switch (contentType) {
    case 'templates':
      currentCategories = templateCategories;
      currentTitle = 'Template Categories';
      break;
    case 'gradients':
      currentCategories = gradientCategories;
      currentTitle = 'Gradient Categories'; // e.g. Pastel, Neon, Dark
      break;
    case 'designs':
      currentCategories = designCategories;
      currentTitle = 'Design Categories';
      break;
    case 'components':
    default:
      currentCategories = componentCategories;
      currentTitle = `${tool === 'figma' ? 'Figma' : 'Framer'} Components`;
      break;
  }

  return (
    <aside className="w-64 flex flex-col gap-4 sticky top-24 h-fit">
      {/* 
         1. SWITCHER FIGMA / FRAMER 
         Disembunyikan jika sedang di mode 'gradients' atau 'designs' (jika designs tidak butuh tool).
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
        onToggle={toggleCategory}
      />

      <div className="mt-4">
        <GoProCard />
      </div>
    </aside>
  );
};
