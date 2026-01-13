'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import { Copy, Plus, Share, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import Image from 'next/image';
import { ArrowRight2 } from 'iconsax-reactjs';

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
      className="group relative flex flex-1 cursor-pointer flex-col items-center justify-start px-4 focus:outline-none"
    >
      {isActive && (
        <motion.div
          layoutId="active-top-line-desktop"
          className="absolute -top-6 z-20 h-[3px] w-12 rounded-b-[2px] bg-[#FF4F00]"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      <div className="relative mb-3 flex h-10 w-10 items-center justify-center">
        {isActive ? (
          <div className="absolute inset-0 z-0 rounded-[10px] bg-[#FF4F00] shadow-[0px_4px_6px_-1px_rgba(255,95,56,0.2)]" />
        ) : (
          <div className="absolute inset-0 z-0 rounded-[10px] border border-transparent bg-gray-100 transition-colors duration-200 group-hover:border-gray-200 group-hover:bg-gray-200" />
        )}
        <div className="relative z-10">
          {React.isValidElement(item.icon)
            ? React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
                className: `w-5 h-5 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-neutral-500 group-hover:text-[#FF4F00]'
                }`,
              })
            : item.icon}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span
            className={`text-[13px] leading-tight font-semibold transition-colors duration-200 ${
              isActive ? 'text-zinc-900' : 'text-neutral-600'
            }`}
          >
            {item.label}
          </span>
          {item.tag && (
            <span
              className={`rounded-[4px] border px-[4px] py-[1px] text-[9px] font-bold tracking-wide uppercase ${
                item.tag.variant === 'default'
                  ? 'border-transparent bg-gray-100 text-neutral-500'
                  : 'border-[#FFD6CC] bg-[#FFF0EB] text-[#FF4F00]'
              }`}
            >
              {item.tag.text}
            </span>
          )}
        </div>
        {item.subLabel && (
          <span className="text-center text-[11px] leading-tight font-medium text-neutral-400">
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
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white">
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
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1070px"
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSubTabId(activeTab.subTabs[0].id);
    } else {
      setActiveSubTabId('');
    }
  }, [activeTab]);

  const activeSubTabData = useMemo(() => {
    if (!activeTab.subTabs) return null;
    return activeTab.subTabs.find((st) => st.id === activeSubTabId) || activeTab.subTabs[0];
  }, [activeTab, activeSubTabId]);

  const currentDisplayImage = activeSubTabData ? activeSubTabData.image : activeTab.image;

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
      <div className="mx-auto w-full max-w-7xl font-sans md:min-h-[800px] md:p-12 lg:-mt-[471px]">
        {/* Navigation Wrapper */}
        <div className="w-full border-y-1 border-[#D3D3D3] px-4 md:relative lg:py-6">
          <span className="absolute -top-[1.8px] right-0 z-[88] hidden h-1 w-1 rounded-full bg-[#D3D3D3] md:flex" />
          <span className="absolute -top-[1.8px] left-0 z-[88] hidden h-1 w-1 rounded-full bg-[#D3D3D3] md:flex" />
          <span className="absolute -bottom-[1.8px] left-0 z-[88] hidden h-1 w-1 rounded-full bg-[#D3D3D3] md:flex" />
          <span className="absolute right-0 -bottom-[1.8px] z-[88] hidden h-1 w-1 rounded-full bg-[#D3D3D3] md:flex" />

          {/* Mobile Header */}
          <div className="relative flex h-[72px] items-center justify-between md:flex lg:hidden lg:p-4">
            <div className="absolute top-0 -left-[2px] h-[3px] w-10 rounded-b-[2px] bg-[#FF4F00] md:-left-[2px]" />
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#FF4F00] text-white shadow-md shadow-orange-500/20"
              >
                {React.isValidElement(activeTab.icon)
                  ? React.cloneElement(activeTab.icon as React.ReactElement<any>, {
                      className: 'size-4',
                    })
                  : activeTab.icon}
              </motion.div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-zinc-900">
                    {activeTab.label}
                  </span>
                </div>
                <span className="mt-0.5 truncate text-xs text-neutral-500">
                  {activeTab.subLabel || 'Explore components'}
                </span>
              </div>
            </div>
            <div className="flex h-full items-center gap-2 border-l border-[#D3D3D3] pl-4">
              <button
                onClick={handlePrev}
                className="flex size-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="flex size-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="relative hidden w-full md:hidden lg:block">
            <div className="pointer-events-none absolute inset-0 flex w-full">
              {tabs.map((_, index) =>
                index > 0 ? (
                  <div
                    key={index}
                    className="absolute top-0 h-full w-px bg-[#D3D3D3]"
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
        <div className="relative flex w-full flex-col items-center px-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTabId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative w-full"
            >
              <div className="mt-10 min-h-[620px] overflow-hidden rounded-xl bg-[#E8E8E8] shadow-[inset_0px_0px_0px_1px_rgba(211,211,211,1.00)] md:min-h-[620px] md:rounded-4xl md:border-[#D3D3D3]">
                {/* Browser Header */}
                <div className="relative z-20 flex h-10 items-center gap-4 border-b border-[#D3D3D3] px-4 md:h-12 md:px-8">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full border border-black/5 bg-[#FF5F57]" />
                    <div className="h-2.5 w-2.5 rounded-full border border-black/5 bg-[#FEBC2E]" />
                    <div className="h-2.5 w-2.5 rounded-full border border-black/5 bg-[#28C840]" />
                  </div>
                  <div className="mx-auto flex max-w-lg flex-1 justify-center">
                    <div className="flex h-7 w-full cursor-default items-center justify-center gap-1.5 rounded-md px-3 text-[11px] text-[#8F8F8F] md:text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8F8F8F]" />
                      <span>moonui.design</span>
                    </div>
                  </div>
                  <div className="hidden gap-3 text-[#8F8F8F] md:flex">
                    <Share size={14} /> <Plus size={14} /> <Copy size={14} />
                  </div>
                </div>
                {/* IMAGE AREA */}
                <div className="group relative h-[542px] px-4 pt-4 md:h-[550px]">
                  <MockBrowserWindow imageSrc={currentDisplayImage} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Global Gradient Overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[60%] bg-gradient-to-t from-[#E8E8E8] via-[#E8E8E8]/90 to-transparent" />

          {/* =========================================================
              FOOTER AREA
             ========================================================= */}

          <div className="pointer-events-none absolute right-4 bottom-6 left-4 z-30 flex justify-center">
            {/* --- 1. MOBILE ONLY FOOTER (< md) --- */}
            {/* TANPA ANIMASI (Static change) sesuai request */}
            <div className="flex w-full flex-col items-center justify-end pb-4 md:flex lg:hidden">
              <div className="pointer-events-auto flex flex-col items-center">
                <div className="group relative mb-4 flex cursor-pointer items-center justify-center">
                  <div className="absolute -z-20 h-[68px] w-[68px] rounded-full border border-neutral-200/50" />
                  {/* Animasi rotasi gradient (Visual saja, bukan transisi konten) */}
                  <motion.div
                    className="absolute -z-10 h-[68px] w-[68px] rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 30%, #FF4F00 90%)',
                      maskImage: 'radial-gradient(closest-side, transparent 97%, black 89%)',
                      WebkitMaskImage: 'radial-gradient(closest-side, transparent 97%, black 89%)',
                    }}
                  />
                  <div className="relative z-10 rounded-full border border-neutral-100 bg-white p-1.5 shadow-sm">
                    {activeTab.ctaIcon ? (
                      activeTab.ctaIcon
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FFD6CC] bg-[#FFF0EB] text-[#FF4F00]">
                        <span className="font-mono text-lg font-bold">{`{}`}</span>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="mb-1 text-center text-lg font-semibold text-zinc-900">
                  {activeTab.ctaTitle || title}
                </h3>
                <p className="mb-5 max-w-[280px] text-center text-sm leading-relaxed text-neutral-500">
                  {activeTab.ctaDescription || description}
                </p>
                <button
                  onClick={onCtaClick}
                  className="group flex cursor-pointer items-center gap-2 rounded-full bg-[#1A1A1A] py-2.5 pr-4 pl-5 text-sm font-medium text-white shadow-lg transition-all hover:bg-black"
                >
                  {activeTab.ctaButtonText || ctaButtonText}
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] transition-transform group-hover:translate-x-0.5">
                    ›
                  </span>
                </button>
              </div>
            </div>

            {/* --- 2. DESKTOP ONLY FOOTER (>= md) --- */}
            {/* Wrapper untuk memastikan posisi tengah */}
            <div className="hidden w-full items-end justify-center md:hidden lg:flex">
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
                  className="pointer-events-auto w-fit max-w-5xl rounded-2xl border border-white/5 bg-[#1C1C1C] p-5 text-white shadow-2xl"
                >
                  {/* Pills Navigation */}
                  <div className="no-scrollbar mb-4 flex items-center gap-2 overflow-x-auto border-b border-dashed border-white/10 pb-4">
                    {activeTab.subTabs?.map((subTab) => {
                      const isActive = subTab.id === activeSubTabId;
                      return (
                        <button
                          key={subTab.id}
                          onClick={() => setActiveSubTabId(subTab.id)}
                          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all ${
                            isActive
                              ? `${
                                  subTab.color || 'bg-zinc-700'
                                } text-white shadow-lg ring-1 ring-white/20`
                              : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                          } `}
                        >
                          {subTab.icon}
                          {subTab.label}
                          {subTab.isSoon && (
                            <span className="ml-1 rounded border border-white/5 bg-zinc-800 px-1.5 py-0.5 text-[9px] tracking-wider text-zinc-500 uppercase">
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
                    <div className="min-w-[200px] flex-1">
                      <motion.h4
                        layout="position"
                        className="mb-1 text-lg font-semibold text-white"
                      >
                        {activeSubTabData?.title || activeTab.label}
                      </motion.h4>
                      <motion.p
                        layout="position"
                        className="text-sm whitespace-nowrap text-zinc-400"
                      >
                        {activeSubTabData?.description || 'Select a category to view details.'}
                      </motion.p>
                    </div>

                    <button
                      onClick={onCtaClick}
                      className={`${
                        activeSubTabData?.color || 'bg-blue-600'
                      } flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:opacity-90`}
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
                  className="pointer-events-auto flex w-fit max-w-4xl items-center gap-6 rounded-2xl border border-white/5 bg-[#1C1C1C] p-5 text-white shadow-2xl"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-800/50 text-zinc-300">
                    {React.isValidElement(activeTab.icon) ? (
                      React.cloneElement(activeTab.icon as React.ReactElement<any>, { size: 24 })
                    ) : (
                      <Layers size={24} />
                    )}
                  </div>

                  <motion.div className="flex-1 whitespace-nowrap" layout="position">
                    <h4 className="mb-1 text-lg font-semibold text-white">{activeTab.ctaTitle}</h4>
                    <p className="text-sm text-zinc-400">{activeTab.ctaDescription}</p>
                  </motion.div>

                  <button
                    onClick={onCtaClick}
                    className={`${
                      activeTab.buttonColor || 'bg-orange-600'
                    } flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:opacity-90`}
                  >
                    {activeTab.ctaButtonText} <ChevronRight size={14} />
                  </button>
                </motion.div>
              )}

              {/* C. STYLE: DEFAULT (Circular CTA for Base) */}
              {(!activeTab.footerStyle || activeTab.footerStyle === 'default') && (
                <div className="flex flex-col items-center justify-end pb-4">
                  {/* Sama dengan mobile, statis tanpa layoutId khusus */}
                  <div className="pointer-events-auto flex flex-col items-center">
                    <div className="group relative mb-4 flex cursor-pointer items-center justify-center">
                      <div className="absolute -z-20 h-[68px] w-[68px] rounded-full border border-neutral-200/50" />
                      <motion.div
                        className="absolute -z-10 h-[70px] w-[68px] rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        style={{
                          background: 'conic-gradient(from 0deg, transparent 30%, #FF4F00 90%)',
                          maskImage: 'radial-gradient(closest-side, transparent 97%, black 89%)',
                          WebkitMaskImage:
                            'radial-gradient(closest-side, transparent 97%, black 89%)',
                        }}
                      />
                      <div className="relative z-10 rounded-full border border-neutral-100 bg-white px-2 py-2.5 text-[#FF4F00] shadow-sm">
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
                              className="mx-[1px] inline-block origin-center" // mx untuk sedikit jarak
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
                    <h3 className="mb-1 text-center text-xl font-semibold text-zinc-900">
                      {activeTab.ctaTitle || title}
                    </h3>
                    <p className="mb-5 max-w-[280px] text-center text-sm leading-relaxed text-neutral-500">
                      {activeTab.ctaDescription || description}
                    </p>
                    <button
                      onClick={onCtaClick}
                      className="group flex cursor-pointer items-center gap-2 rounded-full bg-[#2E2E2E] py-2.5 pr-4 pl-5 text-sm font-medium text-white shadow-[0_8px_16px_rgba(0,0,0,0.1),0_0_0_1px_#000] transition-all hover:bg-black"
                    >
                      {activeTab.ctaButtonText || ctaButtonText}
                      <div className="relative flex h-full w-5 items-center justify-center">
                        <div className="absolute top-0 top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center overflow-hidden text-white">
                          <div className="relative flex flex-1 items-center justify-center transition-transform group-hover:translate-x-1">
                            <ArrowRight2 size={18} />
                          </div>
                        </div>
                      </div>
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
