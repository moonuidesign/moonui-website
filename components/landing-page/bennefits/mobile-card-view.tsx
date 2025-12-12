import React, { cloneElement, isValidElement, useMemo, useState } from 'react';
import { CATEGORIES_CONFIG, Category, Icons } from '.';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
export const MobileCardView = ({
  activeCategory,
}: {
  activeCategory: Category;
}) => {
  // 1. Get configuration
  const config = useMemo(
    () => CATEGORIES_CONFIG.find((c) => c.id === activeCategory),
    [activeCategory],
  );

  // FIX 1: Use lazy initialization.
  // No useEffect needed. The state is calculated correctly on the very first render.
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (config && config.tabs.length > 0) {
      return config.tabs[0].id;
    }
    return '';
  });

  if (!config) return null;

  const { tabs } = config;
  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="w-full max-w-[360px] relative mx-auto flex flex-col gap-5">
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(10px)' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="shadow-[inset_0px_0px_0px_1px_rgba(211,211,211,1.00)] shadow-[inset_0px_0px_0px_0px_rgba(255,255,255,1.00)]  rounded-[20px]"
      >
        <div className="rounded-[28px] px-4 overflow-hidden flex flex-col min-h-[500px] relative transition-colors duration-500">
          <div className="flex items-start h-fit justify-between pt-5 pb-0 border-b relative">
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id;
              const isFirst = index === 0;
              const isLast = index === tabs.length - 1;

              return (
                <React.Fragment key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative pb-4 flex flex-col flex-1 ${
                      isLast
                        ? 'justify-end items-end'
                        : isFirst
                        ? 'justify-start items-start'
                        : 'justify-center items-center'
                    }`}
                  >
                    <div className="flex flex-row items-center gap-1.5">
                      {/* FIX 2: Type Casting for cloneElement */}
                      {isValidElement(tab.icon)
                        ? cloneElement(
                            tab.icon as React.ReactElement<{
                              color: string;
                              variant: string;
                            }>,
                            {
                              color: isActive ? config.themeColor : '#9CA3AF',
                              variant: isActive ? 'Bold' : 'Linear',
                            },
                          )
                        : tab.icon}

                      <span
                        className={`text-[14px] transition-colors duration-300 ${
                          isActive
                            ? 'text-[#2E2E2E] font-medium'
                            : 'text-gray-400/80'
                        }`}
                      >
                        {tab.label}
                      </span>
                    </div>

                    {/* Indikator Garis Bawah (Underline) */}
                    {isActive && (
                      <motion.div
                        layoutId="tab-underline"
                        className={`absolute bottom-0 h-[3px] rounded-full ${
                          isLast
                            ? 'w-full pl-8'
                            : isFirst
                            ? 'w-full pr-8'
                            : 'w-full px-2'
                        }`}
                      >
                        <div
                          className="w-full h-full rounded-full"
                          style={{ backgroundColor: config.themeColor }}
                        />
                      </motion.div>
                    )}
                  </button>
                  {!isLast && (
                    <div className="w-[1px] h-[24px] flex bg-[#D3D3D3]" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="py-6 px-8 text-center">
            <p className="font-medium text-[#666] text-sm leading-relaxed min-h-[40px] flex items-center justify-center">
              {config.subtitle}
            </p>
          </div>

          <div className="flex-1 pb-5 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full rounded-[24px] border-[1.5px] border-gray-100 overflow-hidden flex flex-col h-full min-h-[380px] relative"
              >
                {currentTab && (
                  <Image
                    src={currentTab.image}
                    alt={`${currentTab.label} view`}
                    fill
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <button className="flex -bottom-10 items-center z-[110] absolute justify-between w-full bg-[#1A1A1A] text-white h-14 px-6 rounded-[20px] shadow-xl active:scale-[0.98] transition-all">
        <span className="text-[15px] font-semibold font-sans">
          Explore Template
        </span>
        <div className="flex items-center gap-2 opacity-60">
          <span className="text-[12px] font-medium capitalize">
            {config.title}
          </span>
          <Icons.ArrowRight />
        </div>
      </button>
    </div>
  );
};
