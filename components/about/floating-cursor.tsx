'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingCursorProps {
  label: string;
  color?: string;
  className?: string;
  direction?: 'left' | 'right';
}

export const FloatingCursor: React.FC<FloatingCursorProps> = ({
  label,
  color = '#8b5cf6',
  className,
  direction = 'left', // Default menghadap kiri
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isRight = direction === 'right'; // Helper boolean

  useEffect(() => {
    const moveCursor = () => {
      const randomX = Math.random() * 120 - 60;
      const randomY = Math.random() * 100 - 50;
      setPosition({ x: randomX, y: randomY });
    };

    moveCursor();
    const intervalId = setInterval(moveCursor, 4000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <motion.div
      className={`absolute z-20 pointer-events-none ${className}`}
      animate={{ x: position.x, y: position.y }}
      transition={{
        type: 'tween',
        ease: 'easeInOut',
        duration: 5,
      }}
    >
      {/* Container Relative.
        Kita gunakan Flexbox untuk mengatur aliran layout antara ikon dan teks.
        Jika kanan, kita reverse urutannya.
      */}
      <div
        className={`relative flex items-start ${
          isRight ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* --- 1. Cursor Arrow Icon --- */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`
            absolute -top-3 z-20 drop-shadow-md transition-transform
            ${
              isRight
                ? '-right-3 scale-x-[-1]' // Jika kanan: geser ke kanan container & mirror horizontal
                : '-left-3' // Jika kiri: posisi default
            }
          `}
        >
          <path
            d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19177L11.7841 12.3673H5.65376Z"
            fill={color}
            stroke="white"
            strokeWidth="1"
          />
        </svg>

        {/* --- 2. Chat Bubble (Label Nama) --- */}
        <div
          className={`
            px-3 py-1.5 rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.15)] border-2 border-white flex items-center justify-center whitespace-nowrap
            ${
              isRight
                ? 'rounded-tr-none mr-3' // Jika kanan: Ekor di kanan atas, margin kanan agar tidak kena panah
                : 'rounded-tl-none ml-3' // Jika kiri: Ekor di kiri atas, margin kiri
            }
          `}
          style={{ backgroundColor: color }}
        >
          <span className="text-white text-sm font-medium font-sans leading-none">
            {label}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
