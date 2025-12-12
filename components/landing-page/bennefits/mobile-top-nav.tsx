import React, { useMemo } from 'react';
import { CATEGORIES_CONFIG, Category, Icons } from '.';
import { motion } from 'framer-motion';
export const MobileTopNav = ({
  activeCategory,
  setActiveCategory,
}: {
  activeCategory: string;
  setActiveCategory: (c: Category) => void;
}) => {
  const categories = useMemo(
    () => [
      {
        id: 'hr',
        label: 'HR Management',
        icon: (
          <Icons.User
            width="14"
            height="14"
            style={{
              fill: 'url(#gradient-gray)',
              stroke: 'url(#gradient-gray)',
            }}
          />
        ),
        themeColor: '#7D52F4',
      },
      {
        id: 'finance',
        label: 'Finance',
        icon: (
          <Icons.Finance width="14" height="14" style={{ stroke: '#E0E0E0' }} />
        ),
        themeColor: '#335CFF',
      },
      {
        id: 'marketing',
        label: 'Marketing',
        icon: (
          <Icons.Analytics
            width="14"
            height="14"
            style={{ stroke: '#E0E0E0' }}
          />
        ),
        themeColor: '#FB6B23',
      },
      {
        id: 'crypto',
        label: 'Crypto',
        icon: (
          <Icons.Wallet width="14" height="14" style={{ stroke: '#E0E0E0' }} />
        ),
        themeColor: '#10B981',
      },
      {
        id: 'ai',
        label: 'AI',
        icon: (
          <Icons.Bot width="14" height="14" style={{ stroke: '#E0E0E0' }} />
        ),
        themeColor: '#EC4899',
      },
    ],
    [],
  );

  const isButtonDisabled = (id: string) => {
    const category = CATEGORIES_CONFIG?.find((c) => c.id === id);
    if (!category || category.tabs.length === 0) return true;
    return false;
  };

  return (
    <div className="flex items-center rounded-full gap-0 shadow-[0_0_0_1px_rgba(61,61,61,.12),inset_0_0.75px_0.75px_hsla(0,0%,100%,.64)]  p-1 w-full bg-[#F2F2F2]/50 backdrop-blur-sm overflow-hidden">
      <svg width="0" height="0" className="absolute invisible">
        <defs>
          <linearGradient id="gradient-gray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E0E0E0" stopOpacity="1" />
            <stop offset="100%" stopColor="#E0E0E0" stopOpacity="0" />
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
              animate={{
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                boxShadow: isActive
                  ? '0 4px 8px rgba(41,41,41,0.06), 0 2px 4px rgba(41,41,41,0.04), 0 1px 2px rgba(41,41,41,0.04), inset 0 -0.5px 0.5px rgba(41,41,41,0.08)'
                  : 'none',
                flex: isActive ? 'initial' : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
              className={`
                relative flex  items-center justify-center rounded-full py-[7px] px-[7px] cursor-pointer
                ${!isActive ? 'hover:bg-black/5' : ''}
              `}
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <motion.div
                layout="position"
                className="p-1 rounded-full flex items-center  justify-center shrink-0 z-10"
                style={{
                  backgroundColor: cat.themeColor,
                }}
              >
                {cat.icon}
              </motion.div>

              <motion.div
                initial={false}
                animate={{
                  width: isActive ? 'auto' : 0,
                  opacity: isActive ? 1 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
                className="overflow-hidden whitespace-nowrap"
              >
                <motion.span className="text-[13px] pr-4 font-semibold text-[#333] pl-2 block">
                  {cat.label}
                </motion.span>
              </motion.div>
            </motion.button>

            {!isLast && (
              <motion.div
                initial={false}
                animate={{
                  opacity: hideSeparator ? 0 : 1,
                  scaleY: hideSeparator ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="h-4 w-[1px] bg-[rgba(61,61,61,0.12)] shrink-0 rounded-full mx-1"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
