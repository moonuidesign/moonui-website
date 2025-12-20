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

export const PlatformSwitcher: React.FC<PlatformSwitcherProps> = ({
  currentTool,
  onChange,
}) => {
  const activeClass = 'bg-zinc-800 text-white shadow-md';
  const inactiveClass = 'bg-transparent text-[#3D3D3D] hover:bg-gray-50';

  return (
    <div className="w-full p-1 bg-white rounded-2xl shadow-card-sm inline-flex justify-between items-center overflow-hidden">
      {/* FIGMA */}
      <button
        onClick={() => onChange('figma')}
        className={cn(
          'w-1/2 h-8 px-3 rounded-[10px] flex justify-center items-center gap-1.5 transition-all duration-200',
          currentTool === 'figma' ? activeClass : inactiveClass,
        )}
      >
        {/* Icon Figma Simple CSS */}

        <Image
          alt="Logo Figma"
          width={100}
          height={100}
          src="/ic-figma.svg"
          className="w-[20px] h-[20px]"
        />

        <span className="text-xs font-medium font-['Inter']">Figma</span>
      </button>

      {/* FRAMER */}
      <button
        onClick={() => onChange('framer')}
        className={cn(
          'w-1/2 h-8 px-3 rounded-[10px] flex justify-center items-center gap-1.5 transition-all duration-200',
          currentTool === 'framer' ? activeClass : inactiveClass,
        )}
      >
        <Image
          alt="Logo Framer"
          width={100}
          height={100}
          src="/ic-framer.svg"
          className="w-[20px] h-[20px]"
        />

        <span className="text-xs font-medium font-['Inter']">Framer</span>
      </button>
    </div>
  );
};
