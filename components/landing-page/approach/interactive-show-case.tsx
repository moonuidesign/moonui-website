'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Plus,
  Share,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import Image from 'next/image';

// --- Types ---
export interface SubTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  isSoon?: boolean;
  image: string;
  title: string;
  description: string;
  color?: string;
}

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
  ctaTitle?: string;
  ctaDescription?: string;
  ctaIcon?: React.ReactNode;
  ctaButtonText?: string;
  subTabs?: SubTabItem[];
  // Property untuk mengontrol tampilan footer di desktop
  footerStyle?: 'default' | 'simple-dark' | 'tabbed-dark';
  buttonColor?: string;
}

interface InteractiveShowcaseProps {
  tabs: ShowcaseTabItem[];
  defaultTabId?: string;
  title?: string;
  description?: string;
  ctaButtonText?: string;
  onCtaClick?: () => void;
}

// --- Sub-Component: Desktop Navigation Button ---
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
      className="relative group flex flex-col items-center justify-start px-4 focus:outline-none cursor-pointer flex-1"
    >
      {isActive && (
        <motion.div
          layoutId="active-top-line-desktop"
          className="absolute -top-6 w-12 h-[3px] bg-[#FF5F38] rounded-b-[2px] z-20"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
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
              className={`text-[9px] font-bold px-[4px] py-[1px] rounded-[4px] uppercase tracking-wide border ${
                item.tag.variant === 'default'
                  ? 'bg-gray-100 text-neutral-500 border-transparent'
                  : 'bg-[#FFF0EB] text-[#FF5F38] border-[#FFD6CC]'
              }`}
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
      <AnimatePresence mode="wait">
        <motion.div
          key={imageSrc}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Image
            fill
            src={imageSrc}
            alt="Browser Content"
            className="object-cover object-top"
            priority
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- Main Component ---
const InteractiveShowcase: React.FC<InteractiveShowcaseProps> = ({
  tabs,
  defaultTabId,
  title = 'Start Building Today',
  description = 'Explore our component library and speed up your workflow.',
  ctaButtonText = 'Try live',
  onCtaClick,
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);
  const [activeSubTabId, setActiveSubTabId] = useState<string>('');

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || tabs[0],
    [activeTabId, tabs],
  );

  const activeIndex = tabs.findIndex((t) => t.id === activeTabId);

  // Reset Sub-Tab saat Tab Utama berubah
  useEffect(() => {
    if (activeTab.subTabs && activeTab.subTabs.length > 0) {
      setActiveSubTabId(activeTab.subTabs[0].id);
    } else {
      setActiveSubTabId('');
    }
  }, [activeTab]);

  const activeSubTabData = useMemo(() => {
    if (!activeTab.subTabs) return null;
    return (
      activeTab.subTabs.find((st) => st.id === activeSubTabId) ||
      activeTab.subTabs[0]
    );
  }, [activeTab, activeSubTabId]);

  const currentDisplayImage = activeSubTabData
    ? activeSubTabData.image
    : activeTab.image;

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
      <div className="w-full max-w-7xl mx-auto font-sans md:p-12 lg:-mt-[471px] md:min-h-[800px]">
        {/* Navigation Wrapper */}
        <div className="w-full md:relative border-y-1 px-4 border-[#D3D3D3] lg:py-6">
          <span className="hidden h-1 w-1 md:flex bg-[#D3D3D3] rounded-full absolute -top-[1.8px] right-0 z-[88]" />
          <span className="hidden h-1 w-1 md:flex bg-[#D3D3D3] rounded-full absolute -top-[1.8px] left-0 z-[88]" />
          <span className="hidden h-1 w-1 md:flex bg-[#D3D3D3] rounded-full absolute -bottom-[1.8px] left-0 z-[88]" />
          <span className="hidden h-1 w-1 md:flex bg-[#D3D3D3] rounded-full absolute -bottom-[1.8px] right-0 z-[88]" />

          {/* Mobile Header */}
          <div className="flex md:flex lg:hidden items-center justify-between lg:p-4 relative h-[72px]">
            <div className="absolute top-0 left-0 md:left-6 w-10 h-[3px] bg-[#FF5F38] rounded-b-[2px]" />
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="size-9 flex-shrink-0 bg-[#FF5F38] rounded-lg flex items-center justify-center text-white shadow-md shadow-orange-500/20"
              >
                {React.isValidElement(activeTab.icon)
                  ? React.cloneElement(
                      activeTab.icon as React.ReactElement<any>,
                      { className: 'size-4' },
                    )
                  : activeTab.icon}
              </motion.div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-900 text-sm truncate">
                    {activeTab.label}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 truncate mt-0.5">
                  {activeTab.subLabel || 'Explore components'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-[#D3D3D3] h-full">
              <button
                onClick={handlePrev}
                className="size-6 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-600"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="size-6 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:hidden lg:block relative w-full">
            <div className="absolute inset-0 pointer-events-none flex w-full">
              {tabs.map((_, index) =>
                index > 0 ? (
                  <div
                    key={index}
                    className="h-full w-px bg-[#D3D3D3] absolute top-0"
                    style={{ left: `${(index / tabs.length) * 100}%` }}
                  />
                ) : null,
              )}
            </div>
            <div
              className="grid"
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

        {/* Content Area */}
        <div className="w-full relative flex flex-col items-center px-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTabId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative w-full "
            >
              <div className="md:rounded-xl mt-10 shadow-[inset_0px_0px_0px_1px_rgba(211,211,211,1.00)] rounded-xl bg-[#E8E8E8] md:border-[#D3D3D3] overflow-hidden min-h-[620px] md:min-h-[620px]">
                {/* Browser Header */}
                <div className="h-10 md:h-12 border-b border-[#D3D3D3] flex items-center px-4 gap-4 relative z-20">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] border border-black/5" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] border border-black/5" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] border border-black/5" />
                  </div>
                  <div className="flex-1 flex justify-center max-w-lg mx-auto">
                    <div className=" text-[#D3D3D3] text-[11px] md:text-xs h-7 px-3 rounded-md flex items-center justify-center gap-1.5 w-full cursor-default">
                      <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                      <span>alignui.com</span>
                    </div>
                  </div>
                  <div className="hidden md:flex gap-3 text-neutral-300">
                    <Share size={14} /> <Plus size={14} /> <Copy size={14} />
                  </div>
                </div>
                {/* IMAGE AREA */}
                <div className="relative h-[542px] md:h-[550px] px-4 pt-4 group">
                  <MockBrowserWindow imageSrc={currentDisplayImage} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Global Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#E8E8E8] via-[#E8E8E8]/90 to-transparent pointer-events-none z-10" />

          {/* =========================================================
              FOOTER AREA
             ========================================================= */}

          <div className="absolute bottom-6 left-4 right-4 z-30 flex justify-center pointer-events-none">
            {/* --- 1. MOBILE ONLY FOOTER (< md) --- */}
            {/* TANPA ANIMASI (Static change) sesuai request */}
            <div className="lg:hidden md:flex flex flex-col items-center justify-end pb-4 w-full">
              <div className="pointer-events-auto flex flex-col items-center">
                <div className="relative flex items-center justify-center mb-4 group cursor-pointer">
                  <div className="absolute w-[68px] h-[68px] rounded-full border border-neutral-200/50 -z-20" />
                  {/* Animasi rotasi gradient (Visual saja, bukan transisi konten) */}
                  <motion.div
                    className="absolute w-[68px] h-[68px] rounded-full -z-10"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{
                      background:
                        'conic-gradient(from 0deg, transparent 30%, #FF5F38 90%)',
                      maskImage:
                        'radial-gradient(closest-side, transparent 97%, black 89%)',
                      WebkitMaskImage:
                        'radial-gradient(closest-side, transparent 97%, black 89%)',
                    }}
                  />
                  <div className="bg-white p-1.5 rounded-full shadow-sm border border-neutral-100 z-10 relative">
                    {activeTab.ctaIcon ? (
                      activeTab.ctaIcon
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FFF0EB] text-[#FF5F38] border border-[#FFD6CC]">
                        <span className="font-mono text-lg font-bold">{`{}`}</span>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-1 text-center">
                  {activeTab.ctaTitle || title}
                </h3>
                <p className="text-neutral-500 text-sm mb-5 max-w-[280px] text-center leading-relaxed">
                  {activeTab.ctaDescription || description}
                </p>
                <button
                  onClick={onCtaClick}
                  className="group bg-[#1A1A1A] text-white pl-5 pr-4 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  {activeTab.ctaButtonText || ctaButtonText}
                  <span className="bg-white/10 rounded-full w-5 h-5 flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
                    ›
                  </span>
                </button>
              </div>
            </div>

            {/* --- 2. DESKTOP ONLY FOOTER (>= md) --- */}
            {/* Wrapper untuk memastikan posisi tengah */}
            <div className="hidden md:hidden lg:flex w-full justify-center items-end">
              {/* A. STYLE: TEMPLATES (Dark Card with Pills) */}
              {activeTab.footerStyle === 'tabbed-dark' && (
                <motion.div
                  layout
                  layoutId="footer-card" // KUNCI: ID sama untuk morphing width/height
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  // KUNCI: w-fit agar width menyesuaikan konten
                  className="pointer-events-auto bg-[#1C1C1C] rounded-2xl p-5 shadow-2xl border border-white/5 text-white w-fit max-w-5xl 
                "
                >
                  {/* Pills Navigation */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-4 border-b border-white/10 border-dashed">
                    {activeTab.subTabs?.map((subTab) => {
                      const isActive = subTab.id === activeSubTabId;
                      return (
                        <button
                          key={subTab.id}
                          onClick={() => setActiveSubTabId(subTab.id)}
                          className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                                        ${
                                          isActive
                                            ? `${
                                                subTab.color || 'bg-zinc-700'
                                              } text-white shadow-lg ring-1 ring-white/20`
                                            : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                                        }
                                    `}
                        >
                          {subTab.icon}
                          {subTab.label}
                          {subTab.isSoon && (
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-500 uppercase tracking-wider border border-white/5">
                              Soon
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={activeSubTabId}
                    className="flex items-center justify-between gap-8"
                  >
                    <div className="flex-1 min-w-[200px]">
                      <motion.h4
                        layout="position"
                        className="text-lg font-semibold text-white mb-1"
                      >
                        {activeSubTabData?.title || activeTab.label}
                      </motion.h4>
                      <motion.p
                        layout="position"
                        className="text-zinc-400 text-sm whitespace-nowrap"
                      >
                        {activeSubTabData?.description ||
                          'Select a category to view details.'}
                      </motion.p>
                    </div>

                    <button
                      onClick={onCtaClick}
                      className={`${
                        activeSubTabData?.color || 'bg-blue-600'
                      } hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20 shrink-0`}
                    >
                      Explore - Templates <ChevronRight size={14} />
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {/* B. STYLE: SIMPLE DARK (Blocks & Figma) */}
              {activeTab.footerStyle === 'simple-dark' && (
                <motion.div
                  layout
                  layoutId="footer-card" // KUNCI: ID sama untuk morphing width/height
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  // KUNCI: w-fit agar width menyesuaikan konten
                  className="pointer-events-auto  bg-[#1C1C1C] rounded-2xl p-5 shadow-2xl border border-white/5 text-white w-fit max-w-4xl flex items-center gap-6"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-zinc-800/50 border border-white/10 flex items-center justify-center text-zinc-300">
                    {React.isValidElement(activeTab.icon) ? (
                      React.cloneElement(
                        activeTab.icon as React.ReactElement<any>,
                        { size: 24 },
                      )
                    ) : (
                      <Layers size={24} />
                    )}
                  </div>

                  <motion.div
                    className="flex-1 whitespace-nowrap"
                    layout="position"
                  >
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {activeTab.ctaTitle}
                    </h4>
                    <p className="text-zinc-400 text-sm">
                      {activeTab.ctaDescription}
                    </p>
                  </motion.div>

                  <button
                    onClick={onCtaClick}
                    className={`${
                      activeTab.buttonColor || 'bg-orange-600'
                    } hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20 shrink-0`}
                  >
                    {activeTab.ctaButtonText} <ChevronRight size={14} />
                  </button>
                </motion.div>
              )}

              {/* C. STYLE: DEFAULT (Circular CTA for Base) */}
              {(!activeTab.footerStyle ||
                activeTab.footerStyle === 'default') && (
                <div className="flex flex-col items-center justify-end pb-4">
                  {/* Sama dengan mobile, statis tanpa layoutId khusus */}
                  <div className="pointer-events-auto flex flex-col items-center">
                    <div className="relative flex items-center justify-center mb-4 group cursor-pointer">
                      <div className="absolute w-[68px] h-[68px] rounded-full border border-neutral-200/50 -z-20" />
                      <motion.div
                        className="absolute w-[68px] h-[70px] rounded-full -z-10"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        style={{
                          background:
                            'conic-gradient(from 0deg, transparent 30%, #FF5F38 90%)',
                          maskImage:
                            'radial-gradient(closest-side, transparent 97%, black 89%)',
                          WebkitMaskImage:
                            'radial-gradient(closest-side, transparent 97%, black 89%)',
                        }}
                      />
                      <div className="bg-white text-[#FF5F38] px-2 py-2.5 rounded-full shadow-sm border border-neutral-100 z-10 relative">
                        {activeTab.ctaIcon ? (
                          activeTab.ctaIcon
                        ) : (
                          <div className="flex items-center justify-center font-mono text-lg font-bold">
                            {/* 1. Kurung Kurawal Kiri '{' */}
                            <motion.span
                              animate={{ x: [0, 4, 4, 0] }} // Diam -> Masuk -> Tahan -> Kembali
                              transition={{
                                duration: 2,
                                ease: 'easeInOut',
                                repeat: Infinity,
                                repeatDelay: 0.5, // Waktu berhenti sebentar sebelum ulang
                              }}
                              className="inline-block"
                            >
                              {`{`}
                            </motion.span>

                            {/* 2. Garis Miring '/' */}
                            <motion.span
                              animate={{
                                rotate: [0, 360, 360, 0], // Putar 360 -> Tahan -> Balik Putar
                                scale: [1, 1.2, 1.2, 1], // Sedikit membesar saat berputar
                              }}
                              transition={{
                                duration: 2,
                                ease: 'easeInOut',
                                repeat: Infinity,
                                repeatDelay: 0.5,
                              }}
                              className="inline-block origin-center mx-[1px]" // mx untuk sedikit jarak
                            >
                              /
                            </motion.span>

                            {/* 3. Kurung Kurawal Kanan '}' */}
                            <motion.span
                              animate={{ x: [0, -4, -4, 0] }} // Diam -> Masuk -> Tahan -> Kembali
                              transition={{
                                duration: 2,
                                ease: 'easeInOut',
                                repeat: Infinity,
                                repeatDelay: 0.5,
                              }}
                              className="inline-block"
                            >
                              {`}`}
                            </motion.span>
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900 mb-1 text-center">
                      {activeTab.ctaTitle || title}
                    </h3>
                    <p className="text-neutral-500 text-sm mb-5 max-w-[280px] text-center leading-relaxed">
                      {activeTab.ctaDescription || description}
                    </p>
                    <button
                      onClick={onCtaClick}
                      className="group bg-[#1A1A1A] text-white pl-5 pr-4 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                    >
                      {activeTab.ctaButtonText || ctaButtonText}
                      <span className="bg-white/10 rounded-full w-5 h-5 flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
                        ›
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
};

export default InteractiveShowcase;
