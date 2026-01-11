// components/sidebar/platformSwitcher.tsx
'use client';

import React from 'react';
import { cn } from '@/libs/utils';
import { ToolType } from '@/contexts';
import { LayoutGroup, motion } from 'framer-motion';
import Image from 'next/image';

interface PlatformSwitcherProps {
  currentTool: ToolType;
  onChange: (tool: ToolType) => void;
}

export const PlatformSwitcher: React.FC<PlatformSwitcherProps> = ({ currentTool, onChange }) => {
  return (
    <LayoutGroup>
      <div className="shadow-card-sm inline-flex w-full items-center justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-sm lg:rounded-2xl">
        {/* FIGMA */}
        <button
          onClick={() => onChange('figma')}
          className={cn(
            'relative flex h-7 w-1/2 items-center justify-center gap-1 px-2 transition-all duration-200 lg:h-8 lg:gap-1.5 lg:px-3',
            currentTool === 'figma' ? 'text-white' : 'text-[#3D3D3D] hover:bg-gray-50',
          )}
        >
          {currentTool === 'figma' && (
            <motion.span
              layoutId="active-pill"
              className="absolute inset-0 z-0 rounded-lg bg-zinc-800 shadow-md lg:rounded-[10px]"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <div className="relative z-10 flex items-center gap-1 lg:gap-1.5">
            <Image
              alt="Logo Figma"
              width={100}
              height={100}
              src="/ic-figma.svg"
              className="h-4 w-4 lg:h-[20px] lg:w-[20px]"
            />
            <span className="font-['Inter'] text-[11px] font-medium lg:text-xs">Figma</span>
          </div>
        </button>

        {/* FRAMER */}
        <button
          onClick={() => onChange('framer')}
          className={cn(
            'relative flex h-7 w-1/2 items-center justify-center gap-1 px-2 transition-all duration-200 lg:h-8 lg:gap-1.5 lg:px-3',
            currentTool === 'framer' ? 'text-white' : 'text-[#3D3D3D] hover:bg-gray-50',
          )}
        >
          {currentTool === 'framer' && (
            <motion.span
              layoutId="active-pill"
              className="absolute inset-0 z-0 rounded-lg bg-zinc-800 shadow-md lg:rounded-[10px]"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <div className="relative z-10 flex items-center gap-1 lg:gap-1.5">
            <Image
              alt="Logo Framer"
              width={100}
              height={100}
              src="/ic-framer.svg"
              className="h-4 w-4 lg:h-[20px] lg:w-[20px]"
            />
            <span className="font-['Inter'] text-[11px] font-medium lg:text-xs">Framer</span>
          </div>
        </button>
      </div>
    </LayoutGroup>
  );
};
