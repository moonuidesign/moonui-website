// components/sidebar/CategoryFilter.tsx
'use client';

import React, { useState } from 'react';
import { cn } from '@/libs/utils';
import type { NavCategoryItem } from '@/types/category';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';

interface CategoryFilterProps {
  title: string;
  categories: NavCategoryItem[];
  activeSlugs: string[];
  activeSubSlugs: string[];
  onToggle: (slug: string) => void;
  onToggleSub: (slug: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  title,
  categories,
  activeSlugs,
  activeSubSlugs,
  onToggle,
  onToggleSub,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMainCategoriesOpen, setIsMainCategoriesOpen] = useState(true);
  const [isSubCategoriesOpen, setIsSubCategoriesOpen] = useState(true);

  // Get visible sub-categories (Children of active parents)
  const activeParentNodes = categories.filter((cat) => activeSlugs.includes(cat.slug));
  const visibleSubCategories = activeParentNodes.flatMap((cat) => cat.children || []);

  return (
    <div className="shadow-card-sm w-full overflow-hidden rounded-xl border border-gray-100 border-gray-200 bg-white shadow-sm transition-all lg:rounded-2xl">
      {/* Header / Accordion Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between border-b border-gray-100/50 bg-white px-3 transition-colors hover:bg-gray-50 lg:h-12 lg:px-4"
      >
        <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-gray-800 lg:text-sm">
          {title}
        </span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="flex flex-col gap-4 p-3 lg:gap-6 lg:p-4">
          {/* MAIN CATEGORIES */}
          <div className="flex flex-col gap-2">
            {categories.length > 0 && (
              <button
                onClick={() => setIsMainCategoriesOpen(!isMainCategoriesOpen)}
                className="group flex w-full items-center justify-between"
              >
                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase transition-colors group-hover:text-gray-600">
                  Main Categories
                </span>
                {isMainCategoriesOpen ? (
                  <ChevronDown className="h-3 w-3 text-gray-400 transition-colors group-hover:text-gray-600" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-gray-400 transition-colors group-hover:text-gray-600" />
                )}
              </button>
            )}
            {isMainCategoriesOpen && (
              <div className="animate-in slide-in-from-top-1 fade-in flex flex-wrap gap-2 duration-200">
                <CategoryChip
                  label="All"
                  isActive={activeSlugs.length === 0}
                  onClick={() => onToggle('all')}
                />
                <CategoryChip
                  label="News"
                  isActive={activeSlugs.includes('news')}
                  onClick={() => onToggle('news')}
                />
                {categories.map((cat) => (
                  <CategoryChip
                    key={cat.id}
                    label={cat.name}
                    count={cat.count}
                    isActive={activeSlugs.includes(cat.slug)}
                    onClick={() => onToggle(cat.slug)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* SUB CATEGORIES */}
          {visibleSubCategories.length > 0 && (
            <div className="animate-in slide-in-from-top-1 fade-in flex flex-col gap-2 duration-300">
              <button
                onClick={() => setIsSubCategoriesOpen(!isSubCategoriesOpen)}
                className="group flex w-full items-center justify-between border-t border-gray-100 pt-4"
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-gray-400 transition-colors group-hover:text-gray-600" />
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase transition-colors group-hover:text-gray-600">
                    Sub Categories
                  </span>
                </div>
                {isSubCategoriesOpen ? (
                  <ChevronDown className="h-3 w-3 text-gray-400 transition-colors group-hover:text-gray-600" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-gray-400 transition-colors group-hover:text-gray-600" />
                )}
              </button>
              {isSubCategoriesOpen && (
                <div className="animate-in slide-in-from-top-1 fade-in flex flex-wrap gap-2 duration-200">
                  {visibleSubCategories.map((sub) => (
                    <CategoryChip
                      key={sub.id}
                      label={sub.name}
                      count={sub.count}
                      isActive={activeSubSlugs.includes(sub.slug)}
                      onClick={() => onToggleSub(sub.slug)}
                      variant="sub"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function CategoryChip({
  label,
  count,
  isActive,
  onClick,
  variant = 'main',
}: {
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  variant?: 'main' | 'sub';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
        isActive
          ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
        variant === 'sub' && !isActive && 'border-gray-100 bg-gray-50/50 text-gray-500',
      )}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px]',
            isActive ? 'bg-zinc-700 text-white' : 'bg-gray-100 text-gray-400',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
