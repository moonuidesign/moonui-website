'use client';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import React from 'react';

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = new Array(number || 20).fill(true);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute top-0 left-0 h-[200%] w-[200%] overflow-hidden pointer-events-none"
    >
      {meteors.map((el, idx) => {
        const meteorCount = number || 20;
        // Calculate position to evenly distribute meteors across container width
        const position = idx * (800 / meteorCount) - 400; // Spread across 800px range, centered

        return (
          <span
            key={'meteor' + idx}
            className={cn(
              'animate-meteor-effect absolute h-[1px] w-[1px] rotate-[45deg] rounded-[9999px] bg-[#8A7F8D] shadow-[0_0_0_1px_#ffffff10]',
              "before:absolute before:top-1/2 before:h-[2px] before:w-[50px] before:-translate-y-[50%] before:transform before:bg-gradient-to-r before:from-[#8A7F8D] before:to-transparent before:content-['']",
              className,
            )}
            style={{
              top: '-40px', // Start above the container
              left: position + 'px',
              animationDelay: Math.random() * 5 + 's', // Random delay between 0-5s
              animationDuration: Math.floor(Math.random() * (10 - 5) + 5) + 's', // Keep some randomness in duration
            }}
          ></span>
        );
      })}
    </motion.div>
  );
};
