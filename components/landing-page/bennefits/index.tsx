import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Chart,
  Grid1,
  Message2,
  MoneyChange,
  Setting,
  Wallet,
} from 'iconsax-reactjs';
import { Bot } from 'lucide-react';
import { MobileTopNav } from './mobile-top-nav';
import { MockDashboardContent } from './mock-dashboard-content';
import { CardSwap } from './card-swaps';
import { MobileCardView } from './mobile-card-view';

export type Category = 'hr' | 'finance' | 'marketing' | 'crypto' | 'ai';

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  image: string;
}

export interface CategoryConfig {
  id: Category;
  title: string;
  subtitle: string;
  bgColor: string; // Tailwind class
  themeColor: string; // Hex code
  tabs: TabConfig[];
}

export const CATEGORIES_CONFIG: CategoryConfig[] = [
  {
    id: 'hr',
    title: 'HR Management',
    subtitle: '25+ ready-to-use widgets.',
    bgColor: 'bg-[#7D52F4]',
    themeColor: '#7D52F4',
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        icon: <Grid1 size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
      {
        id: 'calendar',
        label: 'Calendar',
        icon: <Calendar size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Setting size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'finance',
    title: 'Finance & Banking',
    subtitle: 'Complete financial overview.',
    bgColor: 'bg-[#335CFF]',
    themeColor: '#335CFF',
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        icon: <Grid1 size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
      {
        id: 'flow',
        label: 'Flow',
        icon: <MoneyChange size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Setting size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    subtitle: 'Growth statistics & ROI.',
    bgColor: 'bg-[#FB6B23]',
    themeColor: '#FB6B23',
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        icon: <Grid1 size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: <Chart size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Setting size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'crypto',
    title: 'Cryptocurrency',
    subtitle: 'Secure wallet management.',
    bgColor: 'bg-[#10B981]',
    themeColor: '#10B981',
    tabs: [
      {
        id: 'overview',
        label: 'Dashboard',
        icon: <Chart size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
      {
        id: 'wallet',
        label: 'Wallet',
        icon: <Wallet size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Setting size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'ai',
    title: 'AI Assistant',
    subtitle: 'Smart automation tools.',
    bgColor: 'bg-[#EC4899]',
    themeColor: '#EC4899',
    tabs: [
      {
        id: 'overview',
        label: 'Chat',
        icon: <Message2 size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
      {
        id: 'auto',
        label: 'Auto',
        icon: <Bot size={18} />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Setting size="18" />,
        image:
          'https://images.unsplash.com/photo-1761839256601-e768233e25e7?q=80&w=1170&auto=format&fit=crop',
      },
    ],
  },
];

// ==========================================
// 2. ICONS (Consolidated)
// ==========================================

export const Icons = {
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
      <path
        d="M14.356 5.393V12.6067H15.4275V5.393H14.356ZM12.6057 14.357H5.39203V15.4284H12.6057V14.357ZM3.64174 12.6067V5.393H2.57031V12.6067H3.64174ZM5.39203 3.64272H12.6057V2.57129H5.39203V3.64272ZM5.39203 14.357C4.98317 14.357 4.70803 14.357 4.49717 14.3399C4.29146 14.3227 4.19374 14.2927 4.1286 14.2601L3.6426 15.2141C3.88346 15.3367 4.13888 15.3856 4.40974 15.407C4.67546 15.4284 5.00117 15.4284 5.39203 15.4284V14.357ZM2.57031 12.6067C2.57031 12.9984 2.57031 13.3241 2.59174 13.589C2.61403 13.8607 2.66203 14.1153 2.7846 14.3561L3.73946 13.8693C3.70603 13.805 3.67603 13.7064 3.65974 13.5016C3.6426 13.2899 3.64174 13.0156 3.64174 12.6067H2.57031ZM4.1286 14.2601C3.96051 14.1744 3.82481 14.0376 3.73946 13.8693L2.7846 14.3561C2.97317 14.7247 3.27317 15.0264 3.6426 15.2141L4.1286 14.2601ZM14.356 12.6067C14.356 13.0156 14.356 13.2899 14.3389 13.5016C14.3217 13.7073 14.2917 13.805 14.2592 13.8701L15.2132 14.3561C15.3357 14.1153 15.3846 13.8607 15.406 13.589C15.4275 13.3233 15.4275 12.9976 15.4275 12.6067H14.356ZM12.6057 15.4284C12.9975 15.4284 13.3232 15.4284 13.588 15.407C13.8597 15.3847 14.1143 15.3367 14.3552 15.2141L13.8683 14.2601C13.804 14.2927 13.7055 14.3227 13.5006 14.339C13.2889 14.3561 13.0146 14.357 12.6057 14.357V15.4284ZM14.2592 13.8693C14.1735 14.0373 14.0363 14.1744 13.8683 14.2601L14.3552 15.2141C14.7237 15.0256 15.0255 14.7256 15.2132 14.3561L14.2592 13.8693ZM15.4275 5.393C15.4275 5.00215 15.4275 4.67557 15.406 4.41072C15.3837 4.13986 15.3357 3.88443 15.2132 3.64357L14.2592 4.13043C14.2917 4.19472 14.3217 4.29329 14.338 4.49815C14.3552 4.709 14.356 4.98415 14.356 5.393H15.4275ZM12.6057 3.64272C13.0146 3.64272 13.2889 3.64272 13.5006 3.65986C13.7063 3.677 13.804 3.707 13.8692 3.74043L14.3552 2.78557C14.1143 2.663 13.8597 2.61415 13.588 2.59272C13.3223 2.57129 12.9966 2.57129 12.6057 2.57129V3.64272ZM15.2132 3.64357C15.0247 3.27461 14.7239 2.9744 14.3552 2.78557L13.8692 3.74043C14.0372 3.82615 14.1743 3.96243 14.26 4.13043L15.2132 3.64357ZM3.64174 5.393C3.64174 4.985 3.64174 4.709 3.65888 4.49815C3.67603 4.29243 3.70603 4.19472 3.73946 4.12957L2.7846 3.64443C2.66203 3.88529 2.61317 4.14072 2.59174 4.41157C2.57031 4.67643 2.57031 5.00215 2.57031 5.393H3.64174ZM5.39203 2.57129C5.00031 2.57129 4.6746 2.57129 4.40974 2.59272C4.13888 2.615 3.88346 2.663 3.6426 2.78557L4.12946 3.74043C4.19374 3.707 4.29231 3.677 4.49717 3.66072C4.70803 3.64357 4.98317 3.64272 5.39203 3.64272V2.57129ZM3.73946 4.12957C3.82517 3.96157 3.96146 3.82529 4.12946 3.74043L3.6426 2.78557C3.27403 2.97415 2.97146 3.27415 2.78374 3.64357L3.73946 4.12957Z"
        fill="white"
      />
      <path
        d="M7.9269 3.107V2.57129H6.85547V3.107H7.9269ZM6.85547 14.8927V15.4284H7.9269V14.8927H6.85547ZM7.9269 8.99986V3.107H6.85547V8.99986H7.9269ZM6.85547 8.99986V14.8927H7.9269V8.99986H6.85547Z"
        fill="white"
      />
      <path d="M7.57031 9H14.7137" stroke="white" strokeWidth="1.07143" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M8.33203 13.333L11.666 9.99999L8.33203 6.66699"
        stroke="white"
        strokeOpacity="0.72"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  ),
  User: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Finance: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  ),
  Analytics: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="20" x2="12" y2="10"></line>
      <line x1="18" y1="20" x2="18" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>
  ),
  Wallet: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  ),
  Bot: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="11" width="14" height="10" rx="2"></rect>
      <circle cx="12" cy="5" r="2"></circle>
      <path d="M12 7v4"></path>
      <line x1="8" y1="16" x2="8" y2="16"></line>
      <line x1="16" y1="16" x2="16" y2="16"></line>
    </svg>
  ),
};

// ==========================================
// 3. DESKTOP COMPONENTS (Card Swap Logic)
// ==========================================

export interface Slot {
  x: number;
  y: number;
  z: number;
  scale: number;
  zIndex: number;
  opacity: number;
  backgroundColor?: string;
}

export default function Bennefits() {
  const [activeCategory, setActiveCategory] = useState<Category>('hr');
  const getDesktopCards = useCallback((category: Category) => {
    const config = CATEGORIES_CONFIG.find((c) => c.id === category);
    if (!config) return [];
    return config.tabs.map((tab) => ({
      id: tab.id,
      title: `${tab.label} Page`,
      subtitle: config.subtitle,
      bgColor: config.bgColor,
      type: tab.id,
    }));
  }, []);

  const desktopCards = useMemo(
    () => getDesktopCards(activeCategory),
    [activeCategory, getDesktopCards],
  );

  return (
    <div className="max-h-[1600px] h-fit md:h-[1200px] relative lg:max-w-7xl mx-auto bg-[#E8E8E8] flex flex-col items-center py-8 md:py-20 font-sans text-[#2E2E2E]  selection:bg-black/10">
      <div className="md:hidden w-full px-1 lg:px-5 flex flex-col gap-6 max-w-[420px]">
        <div className="flex flex-col items-center gap-4 mb-2">
          <div className="inline-flex h-8 px-3 items-center gap-2 rounded-xl bg-[#8A7F8D] shadow-sm">
            <Icons.Check />
            <span className="text-white text-[12px] font-semibold tracking-wide uppercase">
              Pro Templates
            </span>
          </div>
          <h1 className="text-center text-[32px] leading-[1.1] font-bold text-[#1A1A1A] tracking-tight">
            Ready-made
            <br />
            multi-page flows
          </h1>
        </div>
        <MobileTopNav
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
        <MobileCardView key={activeCategory} activeCategory={activeCategory} />
      </div>

      <div className="hidden md:flex   flex-col items-center md:w-3xl md:overflow-hidden lg:w-6xl md:max-w-6xl lg:max-w-[1440px] px-4">
        <div className="flex flex-col items-center gap-8 mb-16 z-20 relative">
          <div className="inline-flex h-8 px-3 pl-2 items-center gap-1.5 rounded-[9px] bg-[#8A7F8D] shadow-sm">
            <Icons.Check />
            <span className="text-white text-sm font-medium leading-5">
              Sector-specific Templates
            </span>
            <div className="flex px-1.5 py-[3px] items-start rounded-[5px] bg-white/50">
              <span className="text-white text-[11px] font-semibold leading-[10px]">
                PRO
              </span>
            </div>
          </div>

          <h1 className="text-center text-[44px] leading-[56px] tracking-[-1.3px]">
            <span className="font-semibold">Ready</span>—
            <span className="font-semibold">made multi</span>—
            <span className="font-semibold">
              page
              <br />
              user flows for apps
            </span>
          </h1>

          <div className="flex flex-wrap justify-center gap-4 w-3xl">
            {CATEGORIES_CONFIG.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex h-12 px-4 items-center gap-3 rounded-[15px] transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#EBEBEB] ring-2 ring-transparent'
                    : 'bg-[#F7F7F7] shadow-[0_0_0_1px_#EBEBEB] hover:bg-white'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-[7px] flex items-center justify-center shadow-inner ${cat.bgColor}`}
                >
                  <div className="w-2.5 h-2.5 border-2 border-white/80 rounded-full"></div>
                </div>
                <span className="capitalize font-medium text-base text-[#3D3D3D]">
                  {cat.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full flex justify-center  min-h-[600px]">
          <span
            style={{
              zIndex: 100,
            }}
            className="border-x border-2 border-t-0 -bottom-10 rounded-b-4xl absolute pointer-events-none  border-[#D3D3D3] w-full flex h-[calc(100%+70px)] "
          >
            <span className="w-1.5 h-1.5 absolute top-0 -left-[3px] bg-[#D3D3D3] rounded-full" />
            <span className="w-1.5 h-1.5 absolute top-0 -right-[3px] bg-[#D3D3D3] rounded-full" />
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <CardSwap
                width={1000}
                height={600}
                verticalDistance={50}
                delay={4500}
              >
                {desktopCards.map((card, index) => (
                  <div
                    key={card.id + index}
                    className="absolute md:w-2xl lg:w-4xl bg-white rounded-[24px] shadow-2xl border border-white/60 cursor-pointer overflow-hidden transform transition-transform hover:brightness-105"
                  >
                    <div className="h-12 bg-[#FAFAFA] border-b border-[#EBEBEB] flex items-center justify-between px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-[6px] flex items-center justify-center text-white text-xs shadow-sm ${card.bgColor}`}
                        >
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                        <div>
                          <span className="text-[#333] font-medium text-sm">
                            {card.title}
                          </span>
                          <span className="text-[#999] text-xs ml-2 font-normal hidden sm:inline">
                            · {card.subtitle}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-40">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                    </div>
                    <div className="h-[480px]">
                      <MockDashboardContent type={card.type} />
                    </div>
                  </div>
                ))}
              </CardSwap>
            </motion.div>
          </AnimatePresence>
        </div>

        <button className="relative z-[110] bottom-16 flex h-11 px-5 items-center gap-3 rounded-[13px] bg-[#2E2E2E] hover:bg-black text-white shadow-[0_8px_16px_rgba(0,0,0,0.1),0_0_0_1px_#000] transition-colors mt-4">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-medium">Explore Template</span>
            <span className="opacity-30">-</span>
            <span className="opacity-70 font-medium capitalize">
              {CATEGORIES_CONFIG.find((c) => c.id === activeCategory)?.title}
            </span>
          </div>
          <Icons.ArrowRight />
        </button>
      </div>
      <div className="absolute -bottom-10 z-[10] left-0 w-full h-[250px] lg:h-[500px] bg-gradient-to-t from-[#e8e8e8] via-[#e8e8e8] to-transparent pointer-events-none"></div>
    </div>
  );
}
