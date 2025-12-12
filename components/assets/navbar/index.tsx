// components/layout/ContentFilterBar.tsx
'use client';

import { LayoutGrid, FileBox, Palette, PenTool } from 'lucide-react';
import { cn } from '@/libs/utils';
import { useFilter } from '@/contexts';

export default function NavbarFilter() {
  const { contentType, setContentType } = useFilter();

  const activePill =
    'bg-orange-600 text-white shadow-card-sm border-transparent';
  const inactivePill =
    'bg-white text-zinc-800 border-gray-200 hover:bg-gray-50';

  return (
    <div className="w-full py-3 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8">
      {/* Left: Content Types */}
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
      </div>
    </div>
  );
}
