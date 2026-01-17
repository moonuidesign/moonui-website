'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TicketPercent } from 'lucide-react';
import { ArrowRight2 } from 'iconsax-reactjs';
import Image from 'next/image';
import Link from 'next/link';

// ==========================================
// 2. DATA PAKET
// ==========================================
interface PricePlan {
  title: string;
  subtitle: string;
  price: {
    monthly: number;
    yearly: number;
  };
  priceDetail: string;
  features: string[];
  buttonText: string;
  isDark?: boolean;
  isPopular?: boolean;
  gradient: string;
}

const plans: PricePlan[] = [
  {
    title: 'MoonUI Free',
    subtitle: 'Login—start Downloading',
    price: { monthly: 0, yearly: 0 },
    priceDetail: 'free forever',
    features: [
      'Freebie Items Only',
      '5 Downloads / 24 Hours Limit',
      'Delete Anytime',
      '100% Commercial Use',
    ],
    buttonText: 'Create Free Account',
    gradient: 'from-gray-500 to-zinc-900',
  },
  {
    title: 'MoonUI Pro',
    subtitle: 'Subscribe—',
    price: { monthly: 99, yearly: 499 },
    priceDetail: 'billed per cycle',
    features: [
      'Time-Limited Offers',
      '200+ Selected Items',
      'Constantly Growing Library',
      'Premium Download Speed (CDN)',
      'Unlimited Downloads',
      '100% Commercial Use',
    ],
    buttonText: 'Become a Pro',
    isPopular: true,
    gradient: 'from-gray-200 to-stone-300',
  },
  {
    title: 'MoonUI Pro Plus',
    subtitle: 'Life—time Access',
    price: { monthly: 1499, yearly: 1499 },
    priceDetail: 'one—time payment',
    features: [
      'No Subscriptions',
      '200+ Selected Items',
      'Constantly Growing Library',
      'Premium Download Speed (CDN)',
      'Unlimited Downloads',
      '100% Commercial Use',
    ],
    buttonText: 'Become a Pro Plus',
    isDark: true,
    gradient: 'from-yellow-500 to-orange-600',
  },
];

// ==========================================
// 3. KOMPONEN KARTU
// ==========================================
const PricingCard = ({
  plan,
  index,
  isAnnual,
  activeDiscount,
}: {
  plan: PricePlan;
  index: number;
  isAnnual: boolean;
  activeDiscount: { code: string; discount: number } | null;
}) => {
  // --- A. PENENTUAN HARGA ASLI ---
  const originalPrice = isAnnual ? plan.price.yearly : plan.price.monthly;

  // --- B. HITUNG DISKON (JIKA ADA) ---
  let finalPrice = originalPrice;
  const isFree = originalPrice === 0;

  // Jika plan berbayar dan ada diskon aktif -> Hitung potongan
  if (!isFree && activeDiscount) {
    const discountAmount = (originalPrice * activeDiscount.discount) / 100;
    finalPrice = Math.round(originalPrice - discountAmount);
  }

  // --- C. LOGIKA HARGA CORET (HEMAT ANNUAL) ---
  const isLifetime = plan.price.monthly === plan.price.yearly;
  const annualizedMonthlyPrice = plan.price.monthly * 12;

  // Annual savings logic (existing)
  const showAnnualStrikethrough =
    isAnnual && !isLifetime && originalPrice > 0 && annualizedMonthlyPrice > originalPrice;

  // We should prioritize showing the 'active discount' savings if present,
  // or combine them?
  // Let's keep it simple:
  // If active discount exists, we show Original Price (strikethrough) vs Final Discounted Price.
  // If annual savings exist, that's already baked into 'originalPrice' (yearly price) vs 'annualizedMonthlyPrice'.
  // To avoid confusion, let's focus on the Dynamic Discount Visuals.

  const showDiscountStrikethrough = !isFree && activeDiscount;

  // --- D. LOGIKA BADGE KUPON ---
  const showCouponBadge = !isFree && activeDiscount;

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-[32px] border p-4 shadow-xl transition-transform duration-300 ${
        plan.isDark
          ? 'border-zinc-800 bg-zinc-900 text-white'
          : 'border-zinc-100 bg-white text-zinc-800'
      }`}
    >
      <div
        className={`h-40 w-full rounded-2xl bg-gradient-to-br md:h-44 lg:h-40 ${plan.gradient} relative flex flex-col justify-between`}
      >
        <div className="relative z-10 flex h-full flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <h3
              className={`text-2xl font-bold ${
                plan.isDark || plan.title === 'MoonUI Free' ? 'text-white' : 'text-zinc-800'
              }`}
            >
              {plan.title}
            </h3>
            {plan.isPopular && (
              <span className="rounded-full border border-white/30 bg-white px-3 py-1 text-[10px] font-bold text-black uppercase shadow-sm backdrop-blur-md">
                Most Popular
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p
              className={`mt-1 text-sm opacity-80 ${
                plan.isDark || plan.title === 'MoonUI Free' ? 'text-white' : 'text-zinc-800'
              }`}
            >
              {plan.subtitle}
              {index === 1 ? (isAnnual ? 'annual Plan' : 'monthly Plan') : ''}
            </p>
            {showCouponBadge && (
              <div className="animate-fade-in-up mt-2 flex items-center gap-2">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
                    !plan.isDark ? 'bg-[#FF4F00] text-white' : 'bg-white text-zinc-900'
                  }`}
                >
                  <TicketPercent size={12} />
                  <span>CODE: {activeDiscount.code}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 pt-4">
        {/* FITUR LIST */}
        <ul className="flex flex-1 flex-col gap-3 px-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-orange-600">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 3L4.5 8.5L2 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className={`text-sm font-medium ${
                  plan.isDark ? 'text-neutral-300' : 'text-neutral-500'
                }`}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* --- HARGA & LABEL --- */}
        <div className="mt-4">
          <div className="flex gap-2">
            <div className="relative flex h-10 items-end overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={finalPrice}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="block text-4xl leading-none font-bold"
                >
                  ${finalPrice}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* HARGA CORET (VISUAL DISKON) */}
            {showDiscountStrikethrough && (
              <div className="ml-1 flex flex-col leading-none">
                <span
                  className={`text-sm line-through decoration-red-500/50 opacity-60 ${
                    plan.isDark ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                >
                  ${originalPrice}
                </span>
                <span className="text-[10px] font-bold text-[#ff4f00]">
                  Save {activeDiscount?.discount}%
                </span>
              </div>
            )}

            {!showDiscountStrikethrough && showAnnualStrikethrough && (
              <div className="ml-1 flex flex-col leading-none">
                <span
                  className={`text-sm line-through decoration-red-500/50 opacity-60 ${
                    plan.isDark ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                >
                  ${annualizedMonthlyPrice}
                </span>
                <span className="text-[10px] font-bold text-[#ff4f00]">
                  Save ${annualizedMonthlyPrice - originalPrice}
                </span>
              </div>
            )}
          </div>

          <div className={`mt-2 text-sm ${plan.isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {plan.priceDetail}
          </div>
        </div>

        {/* BUTTON */}
        <button
          className={`flex w-full cursor-pointer flex-row items-center justify-center gap-4 rounded-xl py-4 font-semibold shadow-lg transition-all ${
            plan.isDark
              ? 'bg-white text-zinc-900 hover:bg-[#ff4f00] hover:text-white'
              : 'bg-zinc-900 text-white hover:bg-[#ff4f00]'
          }`}
        >
          {index !== 0 && <Image width={24} height={24} src="/ic-diamond-small.svg" alt="" />}
          {plan.buttonText}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN SECTION
// ==========================================
interface PricingSectionProps {
  activeDiscount?: {
    name: string;
    code: string;
    discount: number;
    isActive: boolean;
  } | null;
}

const PricingSection = ({ activeDiscount }: PricingSectionProps) => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="flex w-full flex-col items-center gap-16 px-4 py-16 md:px-8">
      {/* HEADER */}
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-1.5 shadow-md">
          <div className="h-3 w-3 animate-pulse rounded-full bg-white" />
          <span className="text-sm font-medium text-white">Pricing</span>
        </div>

        <h2 className="max-w-5xl text-3xl leading-tight font-semibold text-zinc-800 md:text-5xl">
          Elevate your business with premium <br className="hidden md:block" /> design assets
          library
        </h2>

        {/* TOGGLE SWITCH */}
        <div className="mt-2 flex items-center justify-center">
          <div className="relative flex items-center rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={`relative z-10 w-32 px-6 py-2.5 text-sm font-bold transition-colors duration-300 ${
                !isAnnual ? 'text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {!isAnnual && (
                <motion.div
                  layoutId="pricing-toggle"
                  className="absolute inset-0 z-[-1] rounded-lg bg-zinc-900 shadow-md"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`relative z-10 flex w-32 items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold transition-colors duration-300 ${
                isAnnual ? 'text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {isAnnual && (
                <motion.div
                  layoutId="pricing-toggle"
                  className="absolute inset-0 z-[-1] rounded-lg bg-zinc-900 shadow-md"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              Annual
              <span className="absolute -top-3 -right-8 flex items-center rounded-md border border-orange-200 bg-orange-100 px-2 py-0.5 text-[10px] tracking-wide text-orange-700 uppercase shadow-sm md:-top-3 md:-right-10">
                Save 15%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* GRID CARDS */}
      {/* Layout: tablet = 4 cols (1st centered, 2nd & 3rd below) | desktop = 3 columns */}
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:auto-rows-fr md:grid-cols-4 lg:grid-cols-3 lg:gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`h-full ${
              index === plans.length - 1
                ? 'md:col-span-2 md:col-start-2 lg:col-span-1 lg:col-start-auto'
                : 'md:col-span-2 lg:col-span-1'
            }`}
          >
            <PricingCard
              index={index}
              plan={plan}
              isAnnual={isAnnual}
              activeDiscount={activeDiscount || null}
            />
          </div>
        ))}
      </div>

      {/* BANNER BAWAH */}
      <div className="w-full max-w-6xl">
        <div className="flex w-full flex-col items-center justify-between gap-6 rounded-[30px] border border-zinc-100 bg-white p-6 shadow-lg md:flex-row md:p-6">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <div className="relative flex h-16 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gray-200 to-stone-300">
              <Image
                fill
                className="object-cover object-center"
                src="/ic-pricing.jpg"
                alt="Contact"
              />
            </div>
            <div>
              <h4 className="text-lg font-bold text-zinc-800 md:text-xl">
                Need a custom solution for your business?
              </h4>
              <p className="max-w-lg text-sm text-neutral-500">
                We've partnered with dozens of companies to provide exclusive licensing and
                custom-tailored access.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="shadow-button group flex h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-3.5 overflow-hidden rounded-xl bg-[#2E2E2E] px-6 text-base font-semibold text-white transition-colors hover:bg-black md:h-14 md:w-auto md:px-8"
          >
            Let’s Talk
            <div className="relative flex h-full w-5 items-center justify-center">
              <div className="absolute top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center overflow-hidden text-white">
                <div className="relative flex flex-1 items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowRight2 size={20} />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};
export default PricingSection;
