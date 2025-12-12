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

  // Get visible sub-categories (Children of active parents)
  const activeParentNodes = categories.filter((cat) =>
    activeSlugs.includes(cat.slug),
  );
  const visibleSubCategories = activeParentNodes.flatMap(
    (cat) => cat.children || [],
  );

  return (
    <div className="w-full bg-white rounded-2xl shadow-card-sm overflow-hidden border border-gray-100 transition-all">
      {/* Header / Accordion Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors border-b border-gray-100/50"
      >
        <span className="text-sm font-semibold text-gray-800 font-['Plus_Jakarta_Sans']">
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
        <div className="p-4 flex flex-col gap-6">
          {/* MAIN CATEGORIES */}
          <div className="flex flex-col gap-2">
            {categories.length > 0 && (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Main Categories
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              <CategoryChip
                label="All"
                isActive={activeSlugs.length === 0}
                onClick={() => onToggle('all')}
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
          </div>

          {/* SUB CATEGORIES */}
          {visibleSubCategories.length > 0 && (
            <div className="flex flex-col gap-2 animate-in slide-in-from-top-1 fade-in duration-300">
              <div className="flex items-center gap-1.5 border-t border-gray-100 pt-4">
                <Layers className="h-3 w-3 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Sub Categories
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
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
        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border active:scale-95 flex items-center gap-2',
        isActive
          ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
        variant === 'sub' &&
          !isActive &&
          'bg-gray-50/50 border-gray-100 text-gray-500',
      )}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            'text-[10px] px-1.5 py-0.5 rounded-full',
            isActive ? 'bg-zinc-700 text-white' : 'bg-gray-100 text-gray-400',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
