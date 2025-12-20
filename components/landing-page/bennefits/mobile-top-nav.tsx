import React, { useMemo } from 'react';
import { CATEGORIES_CONFIG, Category } from '.';
import { motion, AnimatePresence } from 'framer-motion';
import { Bank, Candle2, CardAdd, Profile } from 'iconsax-reactjs';
import { Sparkle } from 'lucide-react';

export const MobileTopNav = ({
  activeCategory,
  setActiveCategory,
}: {
  activeCategory: string;
  setActiveCategory: (c: Category) => void;
}) => {
  // 1. Definisi Kategori
  const categories = useMemo(
    () => [
      {
        id: 'hr',
        label: 'HR Management',
        icon: <Profile className="size-4 text-white" variant="Bold" />,
        themeColor: '#7D52F4',
      },
      {
        id: 'finance',
        label: 'Finance',
        icon: <Bank className="size-3 text-white" variant="Bold" />,
        themeColor: '#335CFF',
      },
      {
        id: 'marketing',
        label: 'Marketing',
        icon: <CardAdd className="size-3 text-white" variant="Bold" />,
        themeColor: '#FB6B23',
      },
      {
        id: 'crypto',
        label: 'Crypto',
        icon: <Candle2 className="size-3 text-white" variant="Bold" />,
        themeColor: '#10B981',
      },
      {
        id: 'ai',
        label: 'AI',
        icon: <Sparkle className="size-3 text-white" />,
        themeColor: '#EC4899',
      },
    ],
    [],
  );

  // 2. Logic Disable Button
  const isButtonDisabled = (id: string) => {
    const category = CATEGORIES_CONFIG?.find((c) => c.id === id);
    if (!category || category.tabs.length === 0) return true;
    return false;
  };

  // 3. Konfigurasi Timing Animasi
  // PERBAIKAN: Menambahkan 'as const' agar type: 'spring' terbaca sebagai literal
  const transitionTiming = {
    exitDuration: 0.15,
    enterDelay: 0.15,
    enterSpring: { type: 'spring', stiffness: 150, damping: 25 },
  } as const;

  return (
    <div
      className="
        relative mx-auto mt-8 flex w-full max-w-md items-center justify-between rounded-full 
          p-1 
        shadow-[0_0_0_1px_rgba(61,61,61,0.12),inset_0_0.75px_0.75px_hsla(0,0%,100%,0.64)]
      "
    >
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none opacity-0"
      >
        <defs>
          <linearGradient id="gradient-gray" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#9CA3AF" />
          </linearGradient>
        </defs>
      </svg>

      {categories.map((cat, index) => {
        const isActive = activeCategory === cat.id;
        const isDisabled = isButtonDisabled(cat.id);
        const isNextActive = categories[index + 1]?.id === activeCategory;
        const hideSeparator = isActive || isNextActive;
        const isLast = index === categories.length - 1;

        return (
          <React.Fragment key={cat.id}>
            <motion.button
              layout
              onClick={() => setActiveCategory(cat.id as Category)}
              disabled={isDisabled}
              className={`
                relative isolate flex h-9 min-w-[36px] items-center rounded-full px-1 justify-center
                ${
                  isDisabled
                    ? 'opacity-50 mix-blend-luminosity cursor-not-allowed'
                    : 'cursor-pointer'
                }
              `}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white shadow-[0_4px_8px_rgba(41,41,41,0.06),0_2px_4px_rgba(41,41,41,0.04)] -z-10"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: {
                        delay: transitionTiming.enterDelay,
                        duration: 0.2,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: transitionTiming.exitDuration },
                    }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                layout="position"
                className="relative shadow-[0_4px_8px_rgba(41,41,41,0.06),0_2px_4px_rgba(41,41,41,0.04)] z-10 flex size-6 shrink-0 items-center justify-center rounded-full overflow-hidden "
                style={{
                  backgroundColor: cat.themeColor,
                }}
              >
                {cat.icon}
              </motion.div>

              <div className="relative z-10 flex overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {isActive && (
                    <motion.div
                      key={cat.id + '-text-container'}
                      initial={{ width: 0 }}
                      animate={{
                        width: 'auto',
                        transition: {
                          delay: transitionTiming.enterDelay,
                          ...transitionTiming.enterSpring,
                        },
                      }}
                      exit={{
                        width: 0,
                        transition: { duration: transitionTiming.exitDuration },
                      }}
                      style={{ overflow: 'hidden' }}
                    >
                      <motion.div
                        initial={{ clipPath: 'inset(0% 50% 0% 50%)' }}
                        animate={{
                          clipPath: 'inset(0% 0% 0% 0%)',
                          transition: {
                            delay: transitionTiming.enterDelay,
                            ...transitionTiming.enterSpring,
                          },
                        }}
                        exit={{
                          clipPath: 'inset(0% 50% 0% 50%)',
                          transition: {
                            duration: transitionTiming.exitDuration,
                          },
                        }}
                        className="flex items-center justify-center whitespace-nowrap pl-2.5 pr-[7px] h-full"
                      >
                        <span className="text-[13px] font-semibold text-[#333]">
                          {cat.label}
                        </span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>

            {!isLast && (
              <motion.div
                layout
                initial={false}
                animate={{
                  opacity: hideSeparator ? 0 : 1,
                  scaleY: hideSeparator ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center h-full shrink-0 px-1"
              >
                <div className="h-4 w-px bg-[#D1D5DB] rounded-full" />
              </motion.div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
