// components/layout/ContentFilterBar.tsx
'use client';

import { LayoutGrid, FileBox, Palette, PenTool, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/libs/utils';
import { useFilter } from '@/contexts';

interface NavbarFilterProps {
  onFilterClick?: () => void;
}

export default function NavbarFilter({ onFilterClick }: NavbarFilterProps) {
  const { contentType, setContentType } = useFilter();

  const activePill = 'bg-orange-600 text-white shadow-card-sm border-transparent';
  const inactivePill = 'bg-white text-[#3D3D3D] border-gray-200 hover:bg-gray-50';

  return (
    <div className="flex w-full flex-col gap-4 py-3">
      {/* Row 1: Content Types (Wrap on mobile) */}
      <div className="w-full">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setContentType('components')}
            className={cn(
              'flex h-10 items-center gap-2 rounded-[50px] border px-4 transition-all',
              contentType === 'components' ? activePill : inactivePill,
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="text-sm font-medium">Components</span>
          </button>

          <button
            onClick={() => setContentType('templates')}
            className={cn(
              'flex h-10 items-center gap-2 rounded-[50px] border px-4 transition-all',
              contentType === 'templates' ? activePill : inactivePill,
            )}
          >
            <FileBox className="h-4 w-4" />
            <span className="text-sm font-medium">Templates</span>
          </button>

          <button
            onClick={() => setContentType('designs')}
            className={cn(
              'flex h-10 items-center gap-2 rounded-[50px] border px-4 transition-all',
              contentType === 'designs' ? activePill : inactivePill,
            )}
          >
            <PenTool className="h-4 w-4" />
            <span className="text-sm font-medium">Designs</span>
          </button>

          <button
            onClick={() => setContentType('gradients')}
            className={cn(
              'flex h-10 items-center gap-2 rounded-[50px] border px-4 transition-all',
              contentType === 'gradients' ? activePill : inactivePill,
            )}
          >
            <Palette className="h-4 w-4" />
            <span className="text-sm font-medium">Gradients</span>
          </button>
          <div className="flex items-center md:hidden">
            <button
              onClick={onFilterClick}
              className="flex h-10 items-center justify-center gap-2 rounded-[50px] border border-gray-200 bg-white px-4 shadow-sm transition-all"
            >
              <SlidersHorizontal className="h-4 w-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2 (Mobile Only): Filter Button */}
    </div>
  );
}
