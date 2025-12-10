// components/sidebar/platformSwitcher.tsx
'use client';

import React from 'react';
import { cn } from '@/libs/utils';
import { ToolType } from '@/contexts';

interface PlatformSwitcherProps {
  currentTool: ToolType;
  onChange: (tool: ToolType) => void;
}

export const PlatformSwitcher: React.FC<PlatformSwitcherProps> = ({
  currentTool,
  onChange,
}) => {
  const activeClass = 'bg-zinc-800 text-white shadow-md';
  const inactiveClass = 'bg-transparent text-zinc-800 hover:bg-gray-50';

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
        <div className="w-3 h-3 relative">
          <div
            className={cn(
              'w-2 h-3 left-[2px] top-0 absolute rounded-sm',
              currentTool === 'figma' ? 'bg-white' : 'bg-zinc-800',
            )}
          />
        </div>
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
        {/* Icon Framer Simple CSS */}
        <div className="w-3 h-3 relative">
          <div
            className={cn(
              'w-2 h-3 left-[2px] top-0 absolute rounded-sm',
              currentTool === 'framer' ? 'bg-white' : 'bg-zinc-800',
            )}
          />
        </div>
        <span className="text-xs font-medium font-['Inter']">Framer</span>
      </button>
    </div>
  );
};
