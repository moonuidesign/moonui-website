// components/sidebar/platformSwitcher.tsx
'use client';

import React from 'react';
import { cn } from '@/libs/utils';
import { ToolType } from '@/contexts';
import Image from 'next/image';

interface PlatformSwitcherProps {
  currentTool: ToolType;
  onChange: (tool: ToolType) => void;
}

export const PlatformSwitcher: React.FC<PlatformSwitcherProps> = ({ currentTool, onChange }) => {
  const activeClass = 'bg-zinc-800 text-white shadow-md';
  const inactiveClass = 'bg-transparent text-[#3D3D3D] hover:bg-gray-50';

  return (
    <div className="shadow-card-sm inline-flex w-full items-center justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-sm lg:rounded-2xl">
      {/* FIGMA */}
      <button
        onClick={() => onChange('figma')}
        className={cn(
          'flex h-7 w-1/2 items-center justify-center gap-1 rounded-lg px-2 transition-all duration-200 lg:h-8 lg:gap-1.5 lg:rounded-[10px] lg:px-3',
          currentTool === 'figma' ? activeClass : inactiveClass,
        )}
      >
        {/* Icon Figma Simple CSS */}

        <Image
          alt="Logo Figma"
          width={100}
          height={100}
          src="/ic-figma.svg"
          className="h-4 w-4 lg:h-[20px] lg:w-[20px]"
        />

        <span className="font-['Inter'] text-[11px] font-medium lg:text-xs">Figma</span>
      </button>

      {/* FRAMER */}
      <button
        onClick={() => onChange('framer')}
        className={cn(
          'flex h-7 w-1/2 items-center justify-center gap-1 rounded-lg px-2 transition-all duration-200 lg:h-8 lg:gap-1.5 lg:rounded-[10px] lg:px-3',
          currentTool === 'framer' ? activeClass : inactiveClass,
        )}
      >
        <Image
          alt="Logo Framer"
          width={100}
          height={100}
          src="/ic-framer.svg"
          className="h-4 w-4 lg:h-[20px] lg:w-[20px]"
        />

        <span className="font-['Inter'] text-[11px] font-medium lg:text-xs">Framer</span>
      </button>
    </div>
  );
};
