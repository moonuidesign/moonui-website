'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import { cn } from '@/libs/utils';

interface FloatingCursorProps {
  label: string;
  color?: string;
  className?: string;
  direction?: 'left' | 'right';
  mouseX?: number;
  mouseY?: number;
  isHovering?: boolean;
}

export const FloatingCursor: React.FC<FloatingCursorProps> = ({
  label,
  color = '#8b5cf6',
  className,
  direction = 'left',
  mouseX = 0,
  mouseY = 0,
  isHovering = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  // State for random wandering animation
  const [randomOffset, setRandomOffset] = useState({ x: 0, y: 0 });

  const isRight = direction === 'right';

  // Effect to move cursor randomly when NOT hovering.
  // We use recursive setTimeout to vary the speed and pause duration,
  // making it look closer to natural mouse movement (stop & go).
  useEffect(() => {
    if (isHovering) return;

    let timeoutId: NodeJS.Timeout;

    const moveRandomly = () => {
      const isSmallMove = Math.random() > 0.5;

      // Reduce range to prevent going out of bounds
      const rangeX = isSmallMove ? 20 : 60;
      const rangeY = isSmallMove ? 15 : 40;

      setRandomOffset({
        x: Math.random() * (rangeX * 2) - rangeX,
        y: Math.random() * (rangeY * 2) - rangeY,
      });

      // Random delay before next move (2000ms to 4000ms) to allow drift to finish
      const nextDelay = Math.random() * 2000 + 2000;
      timeoutId = setTimeout(moveRandomly, nextDelay);
    };

    moveRandomly();

    return () => clearTimeout(timeoutId);
  }, [isHovering]);

  // Capture initial position relative to parent container
  useEffect(() => {
    const updatePosition = () => {
      if (ref.current) {
        setInitialPos({
          x: ref.current.offsetLeft,
          y: ref.current.offsetTop,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  // Calculate target position
  const targetX = isHovering ? mouseX - initialPos.x : randomOffset.x;
  const targetY = isHovering ? mouseY - initialPos.y : randomOffset.y;

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-20 pointer-events-none flex items-start gap-2',
        className,
      )}
    >
      <motion.div
        animate={{
          x: targetX,
          y: targetY,
        }}
        transition={
          isHovering
            ? {
              type: 'spring',
              damping: 20,
              stiffness: 300,
              mass: 0.5,
            }
            : {
              type: 'tween',
              ease: 'easeInOut',
              duration: 2,
            }
        }
        className="relative"
      >
        {/* Container Relative. Flexbox for layout flow. */}
        <div
          className={`relative flex items-start ${isRight ? 'flex-row-reverse' : 'flex-row'
            }`}
        >
          {/* --- 1. Cursor Arrow Icon --- */}
          <div className="relative drop-shadow-md" style={{ color: color }}>
            <MousePointer2
              className={cn(
                'w-5 h-5 fill-current',
                // Mirror if direction is right
                isRight && '-scale-x-100',
              )}
            />
          </div>

          {/* --- 2. Chat Bubble (Label Nama) --- */}
          <div
            className={cn(
              'px-3 py-1.5 mt-5 bg-white rounded-full text-white text-xs font-bold shadow-md whitespace-nowrap border-2 border-white',
              isRight ? ' rounded-tr-none' : ' rounded-tl-none',
            )}
            style={{ backgroundColor: color }}
          >
            {label}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
