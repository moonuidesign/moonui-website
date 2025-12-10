'use client';

import React, { useState, useMemo } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import { Copy, Plus, Share, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// --- Types ---
export interface ShowcaseTabItem {
  id: string;
  label: string;
  subLabel?: string;
  tag?: {
    text: string;
    variant: 'default' | 'pro';
  };
  icon: React.ReactNode;
  image: string;
}

interface InteractiveShowcaseProps {
  tabs: ShowcaseTabItem[];
  defaultTabId?: string;
  title?: string;
  description?: string;
  onCtaClick?: () => void;
}

// --- Sub-Component: Navigation Button (DESKTOP ONLY) ---
const DesktopNavButton = ({
  item,
  isActive,
  onClick,
}: {
  item: ShowcaseTabItem;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="relative group flex flex-col items-center justify-start  px-4 focus:outline-none cursor-pointer flex-1"
    >
      {/* Active Top Orange Line */}
      {isActive && (
        <motion.div
          layoutId="active-top-line-desktop"
          className="absolute -top-6 w-12 h-[3px] bg-[#FF5F38] rounded-b-[2px] z-20"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}

      {/* Icon Container */}
      <div className="relative w-10 h-10 mb-3 flex items-center justify-center">
        {isActive ? (
          <div className="absolute inset-0 rounded-[10px] bg-[#FF5F38] shadow-[0px_4px_6px_-1px_rgba(255,95,56,0.2)] z-0" />
        ) : (
          <div className="absolute inset-0 rounded-[10px] bg-gray-100 border border-transparent group-hover:border-gray-200 group-hover:bg-gray-200 transition-colors duration-200 z-0" />
        )}

        <div className="relative z-10">
          {React.isValidElement(item.icon)
            ? React.cloneElement(
                item.icon as React.ReactElement<{ className?: string }>,
                {
                  className: `w-5 h-5 transition-colors duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-neutral-500 group-hover:text-[#FF5F38]'
                  }`,
                },
              )
            : item.icon}
        </div>
      </div>

      {/* Text Content */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span
            className={`text-[13px] font-semibold leading-tight transition-colors duration-200 ${
              isActive ? 'text-zinc-900' : 'text-neutral-600'
            }`}
          >
            {item.label}
          </span>
          {item.tag && (
            <span
              className={`
                text-[9px] font-bold px-[4px] py-[1px] rounded-[4px] uppercase tracking-wide border
                ${
                  item.tag.variant === 'default'
                    ? 'bg-gray-100 text-neutral-500 border-transparent'
                    : 'bg-[#FFF0EB] text-[#FF5F38] border-[#FFD6CC]'
                }
              `}
            >
              {item.tag.text}
            </span>
          )}
        </div>
        {item.subLabel && (
          <span className="text-[11px] text-neutral-400 font-medium text-center leading-tight">
            {item.subLabel}
          </span>
        )}
      </div>
    </button>
  );
};

// --- Sub-Component: Mock Browser Window ---
const MockBrowserWindow = ({ imageSrc }: { imageSrc: string }) => {
  return (
    <div className="w-full h-full overflow-hidden rounded-xl bg-white relative">
      <Image
        fill
        src={imageSrc}
        alt="Browser Content"
        className="object-cover object-top opacity-100"
        priority
      />
    </div>
  );
};

// --- Main Component ---
const InteractiveShowcase: React.FC<InteractiveShowcaseProps> = ({
  tabs,
  defaultTabId,
  title = 'Try live editor',
  description = 'Click on the button to use the code editor',
  onCtaClick,
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || tabs[0],
    [activeTabId, tabs],
  );

  const activeIndex = tabs.findIndex((t) => t.id === activeTabId);

  // --- Handlers for Mobile Navigation ---
  const handlePrev = () => {
    const newIndex = (activeIndex - 1 + tabs.length) % tabs.length;
    setActiveTabId(tabs[newIndex].id);
  };

  const handleNext = () => {
    const newIndex = (activeIndex + 1) % tabs.length;
    setActiveTabId(tabs[newIndex].id);
  };

  return (
    <LayoutGroup>
      <div className="w-full max-w-7xl mx-auto font-sans  md:p-12 md:min-h-[800px]">
        <div className="w-full  md:relative border-y-1  px-4 border-[#D3D3D3]">
          <span className="h-1 w-1 flex bg-[#D3D3D3] rounded-full absolute -top-[1.8px] right-0 z-[88]" />
          <span className="h-1 w-1 flex bg-[#D3D3D3] rounded-full absolute -top-[1.8px] left-0 z-[88]" />
          <span className="h-1 w-1 flex bg-[#D3D3D3] rounded-full absolute -bottom-[1.8px] left-0 z-[88]" />
          <span className="h-1 w-1 flex bg-[#D3D3D3] rounded-full absolute -bottom-[1.8px] right-0 z-[88]" />
          <div className="flex md:hidden items-center justify-between  lg:p-4 relative h-[72px]">
            <div className="absolute top-0 left-6 w-10 h-[3px] bg-[#FF5F38]  rounded-b-[2px]" />
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="size-9 flex-shrink-0 bg-[#FF5F38] rounded-lg flex items-center justify-center text-white shadow-md shadow-orange-500/20"
              >
                {React.isValidElement(activeTab.icon)
                  ? React.cloneElement(
                      activeTab.icon as React.ReactElement<{
                        className?: string;
                      }>,
                      { className: 'size-4' },
                    )
                  : activeTab.icon}
              </motion.div>

              {/* Text Info */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-900 text-sm truncate">
                    {activeTab.label}
                  </span>
                  {activeTab.tag && (
                    <span
                      className={`
                          text-[9px] font-bold px-[4px] py-[1px] rounded-[4px] uppercase tracking-wide border leading-tight
                          ${
                            activeTab.tag.variant === 'default'
                              ? 'bg-gray-100 text-neutral-500 border-transparent'
                              : 'bg-[#FFF0EB] text-[#FF5F38] border-[#FFD6CC]'
                          }
                       `}
                    >
                      {activeTab.tag.text}
                    </span>
                  )}
                </div>
                {activeTab.subLabel && (
                  <span className="text-xs text-neutral-500 truncate mt-0.5">
                    {activeTab.subLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Right Side: Navigation Buttons */}
            <div className="flex items-center gap-2 pl-4 border-l border-[#D3D3D3] h-full">
              <button
                onClick={handlePrev}
                className="size-6 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 active:scale-95 transition-all"
                aria-label="Previous tab"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="size-6 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 active:scale-95 transition-all"
                aria-label="Next tab"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="hidden md:block relative w-full">
            <div className="absolute inset-0 pointer-events-none flex w-full">
              {tabs.map((_, index) =>
                index > 0 ? (
                  <div
                    key={index}
                    className="h-full w-px bg-neutral-100 absolute top-0"
                    style={{ left: `${(index / tabs.length) * 100}%` }}
                  />
                ) : null,
              )}
            </div>

            {/* Desktop Tabs */}
            <div
              className="grid "
              style={{
                gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
              }}
            >
              {tabs.map((tab) => (
                <DesktopNavButton
                  key={tab.id}
                  item={tab}
                  isActive={activeTabId === tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content Area (Browser) */}
        <div className="w-full  md:mt-12 relative flex flex-col items-center px-1  bg-[#E8E8E8]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTabId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-5xl"
            >
              {/* Browser Window Frame */}
              <div className=" md:rounded-xl mt-10 shadow-[inset_0px_0px_0px_1px_rgba(211,211,211,1.00)] rounded-xl shadow-[inset_0px_0px_0px_0px_rgba(255,255,255,1.00)]  md:border-b md:border md:border-[#D3D3D3]  overflow-hidden min-h-[542px] md:min-h-[550px]">
                {/* Browser Header */}
                <div className="h-10 md:h-12  border-b border-[#D3D3D3] flex items-center px-4 gap-4 relative z-20">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] border border-black/5" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] border border-black/5" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] border border-black/5" />
                  </div>

                  {/* Address Bar */}
                  <div className="flex-1 flex justify-center max-w-lg mx-auto">
                    <div className="bg-neutral-50 hover:bg-neutral-100 transition-colors text-neutral-400 text-[11px] md:text-xs h-7 px-3 rounded-md flex items-center justify-center gap-1.5 w-full cursor-default">
                      <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                      <span className="opacity-60">alignui.com</span>
                    </div>
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden md:flex gap-3 text-neutral-300">
                    <Share size={14} />
                    <Plus size={14} />
                    <Copy size={14} />
                  </div>
                </div>
                <div className="relative h-[542px] md:h-[550px] px-4 pt-4 group">
                  <MockBrowserWindow imageSrc={activeTab.image} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#E8E8E8] via-[#E8E8E8]/90 to-transparent pointer-events-none z-10" />
          {/* Floating CTA Section */}
          <div className="absolute bottom-10 left-0 right-0 z-30 flex flex-col items-center justify-end pointer-events-none px-4">
            <div className="pointer-events-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="relative flex items-center justify-center mb-4 group cursor-pointer">
                {/* 1. Track Tipis (Lingkaran Abu-abu samar di belakang - Opsional) */}
                <div className="absolute w-[68px] h-[68px] rounded-full border border-neutral-200/50 -z-20" />

                {/* 2. Animasi Fading Tail (Conic Gradient) */}
                <motion.div
                  className="absolute w-[68px] h-[68px] rounded-full -z-10"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5, // Durasi putaran
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    // KUNCI: Membuat gradasi melingkar dari Transparan ke Warna Solid
                    background:
                      'conic-gradient(from 0deg, transparent 30%, #FF5F38 90%)',

                    // KUNCI: Melubangi bagian tengah lingkaran agar menjadi cincin (Ring)
                    maskImage:
                      'radial-gradient(closest-side, transparent 97%, black 89%)',
                    WebkitMaskImage:
                      'radial-gradient(closest-side, transparent 97%, black 89%)',
                  }}
                />

                {/* 3. Tombol Asli */}
                <div className="bg-white p-1.5 rounded-full shadow-sm border border-neutral-100 z-10 relative">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FFF0EB] text-[#FF5F38] border border-[#FFD6CC]">
                    <span className="font-mono text-lg font-bold">{`{}`}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg md:text-xl font-semibold text-zinc-900 mb-1 text-center">
                {title}
              </h3>
              <p className="text-neutral-500 text-sm mb-5 max-w-[280px] text-center leading-relaxed">
                {description}
              </p>

              <button
                onClick={onCtaClick}
                className="group bg-[#1A1A1A] text-white pl-5 pr-4 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                Try live
                <span className="bg-white/10 rounded-full w-5 h-5 flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
                  ›
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
};

export default InteractiveShowcase;
