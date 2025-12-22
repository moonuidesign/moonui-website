// components/layout/ContentFilterBar.tsx
'use client';

import {
  LayoutGrid,
  FileBox,
  Palette,
  PenTool,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { useFilter } from '@/contexts';

interface NavbarFilterProps {
  onFilterClick?: () => void;
}

export default function NavbarFilter({ onFilterClick }: NavbarFilterProps) {
  const { contentType, setContentType } = useFilter();

  const activePill =
    'bg-orange-600 text-white shadow-card-sm border-transparent';
  const inactivePill =
    'bg-white text-[#3D3D3D] border-gray-200 hover:bg-gray-50';

  return (
    <div className="w-full py-3 flex flex-col gap-4 mb-8">
      {/* Row 1: Content Types (Wrap on mobile) */}
      <div className="w-full">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setContentType('components')}
            className={cn(
              'h-10 px-4 rounded-[50px] border flex items-center gap-2 transition-all',
              contentType === 'components' ? activePill : inactivePill,
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-sm font-medium">Components</span>
          </button>

          <button
            onClick={() => setContentType('templates')}
            className={cn(
              'h-10 px-4 rounded-[50px] border flex items-center gap-2 transition-all',
              contentType === 'templates' ? activePill : inactivePill,
            )}
          >
            <FileBox className="w-4 h-4" />
            <span className="text-sm font-medium">Templates</span>
          </button>

          <button
            onClick={() => setContentType('designs')}
            className={cn(
              'h-10 px-4 rounded-[50px] border flex items-center gap-2 transition-all',
              contentType === 'designs' ? activePill : inactivePill,
            )}
          >
            <PenTool className="w-4 h-4" />
            <span className="text-sm font-medium">Designs</span>
          </button>

          <button
            onClick={() => setContentType('gradients')}
            className={cn(
              'h-10 px-4 rounded-[50px] border flex items-center gap-2 transition-all',
              contentType === 'gradients' ? activePill : inactivePill,
            )}
          >
            <Palette className="w-4 h-4" />
            <span className="text-sm font-medium">Gradients</span>
          </button>
          <div className="flex lg:hidden items-center">
            <button
              onClick={onFilterClick}
              className="h-10 px-4 rounded-[50px] bg-white border border-gray-200  flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2 (Mobile Only): Filter Button */}
    </div>
  );
}
