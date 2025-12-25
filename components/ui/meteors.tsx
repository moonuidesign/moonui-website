'use client';

import React, { useEffect, useState } from 'react';

import { cn } from '@/libs/utils';

interface MeteorsProps {
  number?: number;
  minDelay?: number;
  maxDelay?: number;
  minDuration?: number;
  maxDuration?: number;
  angle?: number;
  className?: string;
}

export default function Meteors({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>(
    [],
  );

  useEffect(() => {
    const styles = [...new Array(number)].map(() => ({
      '--angle': -angle + 'deg',
      top: '-5%',
      // Random position 0-100% relative to container
      left: Math.floor(Math.random() * 100) + '%',
      animationDelay: Math.random() * (maxDelay - minDelay) + minDelay + 's',
      animationDuration:
        Math.floor(Math.random() * (maxDuration - minDuration) + minDuration) +
        's',
    }));
    setMeteorStyles(styles);
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle]);

  return (
    <>
      {[...meteorStyles].map((style, idx) => (
        <span
          key={idx}
          style={{ ...style }}
          className={cn(
            'animate-meteor pointer-events-none absolute left-1/2 top-1/2 size-5 rotate-[var(--angle)]',
            className,
          )}
        >
          {/* Meteor Tail */}
          <div
            style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
            className="absolute top-1/2 left-1/2 rounded-full -z-10 h-[10px] w-[300px] -translate-y-1/2 bg-gradient-to-r from-zinc-500 to-transparent"
          />

          {/* Meteor Head */}
          <div className="absolute top-1/2 left-[49%] z-10 h-[9.5px] w-[9.5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-500 shadow-[0_0_0_1px_#ffffff10]" />
        </span>
      ))}
    </>
  );
}
