// components/layout/ContentFilterBar.tsx
'use client';

import {
  LayoutGrid,
  FileBox,
  Palette,
  Monitor,
  Smartphone,
  Globe,
  PenTool,
  Layers,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { PlatformType, useFilter } from '@/contexts';

export const NavbarFilter = () => {
  const { contentType, setContentType, platform, setPlatform } = useFilter();

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

      {/* Right: Platform Filter */}
      {contentType !== 'gradients' && contentType !== 'designs' && (
        <div className="p-1.5 bg-zinc-100 rounded-[50px] flex items-center gap-1 overflow-x-auto max-w-full">
          {(
            [
              'all',
              'web',
              'ios',
              'android',
              'desktop',
              'cross_platform',
            ] as PlatformType[]
          ).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={cn(
                'h-8 px-3 rounded-[20px] text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap',
                platform === p
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700',
              )}
            >
              {p === 'all' && <LayoutGrid className="w-3 h-3" />}
              {p === 'web' && <Globe className="w-3 h-3" />}
              {p === 'ios' && <Smartphone className="w-3 h-3" />}
              {p === 'android' && <Smartphone className="w-3 h-3" />}
              {p === 'desktop' && <Monitor className="w-3 h-3" />}
              {p === 'cross_platform' && <Layers className="w-3 h-3" />}

              {p === 'cross_platform'
                ? 'Cross Platform'
                : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
