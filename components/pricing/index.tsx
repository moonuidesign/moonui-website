'use client';
import React, { useState } from 'react';
import { TicketPercent } from 'lucide-react';
import { ArrowRight2 } from 'iconsax-reactjs';

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
    subtitle: 'Subscribe—annual Plan',
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
  isAnnual,
  activeDiscount,
}: {
  plan: PricePlan;
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
    isAnnual &&
    !isLifetime &&
    originalPrice > 0 &&
    annualizedMonthlyPrice > originalPrice;

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
      className={`relative p-4 flex flex-col h-full rounded-[32px] overflow-hidden border transition-transform duration-300 shadow-xl
        ${plan.isDark
          ? 'bg-zinc-900 text-white border-zinc-800'
          : 'bg-white text-zinc-800 border-zinc-100'
        }`}
    >
      <div
        className={`h-40 w-full rounded-2xl bg-gradient-to-br ${plan.gradient} flex flex-col justify-between relative`}
      >
        <div className="relative p-4 flex flex-col justify-between z-10 h-full">
          <div className="flex justify-between items-center">
            <h3
              className={`text-2xl font-bold ${plan.isDark || plan.title === 'MoonUI Free'
                ? 'text-white'
                : 'text-zinc-800'
                }`}
            >
              {plan.title}
            </h3>
            {plan.isPopular && (
              <span className="bg-white/20 backdrop-blur-md border border-white/30 text-zinc-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase">
                Most Popular
              </span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <p
              className={`text-sm opacity-80 mt-1 ${plan.isDark || plan.title === 'MoonUI Free'
                ? 'text-white'
                : 'text-zinc-800'
                }`}
            >
              {plan.subtitle}
            </p>
            {showCouponBadge && (
              <div className="flex items-center gap-2 mb-2 animate-fade-in-up">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border
                    ${plan.isDark
                      ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
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

      <div className="pt-4 flex flex-col flex-1 gap-6">
        {/* FITUR LIST */}
        <ul className="flex flex-col gap-3 flex-1">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 bg-orange-600 rounded flex-shrink-0 flex items-center justify-center">
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
                className={`text-sm font-medium ${plan.isDark ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* --- HARGA & LABEL --- */}
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold leading-none">
              ${finalPrice}
            </span>

            {/* HARGA CORET (VISUAL DISKON) */}
            {showDiscountStrikethrough && (
              <div className="flex flex-col leading-none ml-1">
                <span
                  className={`text-sm line-through decoration-red-500/50 opacity-60 ${plan.isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                >
                  ${originalPrice}
                </span>
                <span className="text-[10px] text-green-600 font-bold">
                  Save {activeDiscount?.discount}%
                </span>
              </div>
            )}

            {!showDiscountStrikethrough && showAnnualStrikethrough && (
              <div className="flex flex-col leading-none ml-1">
                <span
                  className={`text-sm line-through decoration-red-500/50 opacity-60 ${plan.isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                >
                  ${annualizedMonthlyPrice}
                </span>
                <span className="text-[10px] text-green-600 font-bold">
                  Save ${(annualizedMonthlyPrice - originalPrice)}
                </span>
              </div>
            )}

          </div>

          <div
            className={`text-sm mt-2 ${plan.isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}
          >
            {plan.priceDetail}
          </div>
        </div>

        {/* BUTTON */}
        <button
          className={`w-full  py-4 rounded-xl font-semibold transition-all shadow-lg active:scale-95
          ${plan.isDark
              ? 'bg-white text-zinc-900 hover:bg-[#f4f00]'
              : 'bg-zinc-900 text-white hover:bg-[#ff4f00]'
            }`}
        >
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
    <section className="w-full py-16 px-4 md:px-8 flex flex-col gap-16 items-center ">
      {/* HEADER */}
      <div className="flex flex-col items-center text-center gap-6">
        <div className="px-4 py-1.5 bg-orange-600 rounded-lg shadow-md flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="text-white text-sm font-medium">Pricing</span>
        </div>

        <h2 className="max-w-5xl text-zinc-800 text-3xl md:text-5xl font-semibold leading-tight">
          Elevate your business with premium <br className="hidden md:block" />{' '}
          design assets library
        </h2>

        {/* TOGGLE SWITCH */}
        <div className="flex items-center justify-center mt-2">
          <div className="relative flex items-center p-1 bg-white border border-zinc-200 rounded-xl shadow-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={`relative z-10 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300
                ${!isAnnual
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-900'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`relative z-10 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2
                ${isAnnual
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-900'
                }`}
            >
              Annual
              <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wide border border-orange-200">
                Save ~15%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* GRID CARDS */}
      {/* Layout: tablet = 4 cols (1st centered, 2nd & 3rd below) | desktop = 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 md:auto-rows-fr gap-6 lg:gap-8 w-full max-w-6xl">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`h-full ${index === plans.length - 1
              ? 'md:col-start-2 md:col-span-2 lg:col-start-auto lg:col-span-1'
              : 'md:col-span-2 lg:col-span-1'
              }`}
          >
            <PricingCard plan={plan} isAnnual={isAnnual} activeDiscount={activeDiscount || null} />
          </div>
        ))}
      </div>

      {/* BANNER BAWAH */}
      <div className="w-full max-w-7xl">
        <div className="w-full bg-white border border-zinc-100 rounded-[30px] p-6 md:p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-24 h-16 bg-gradient-to-br from-gray-200 to-stone-300 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/30" />
            </div>
            <div>
              <h4 className="text-zinc-800 text-lg md:text-xl font-bold">
                Need a custom solution for your business?
              </h4>
              <p className="text-neutral-500 text-sm max-w-lg">
                We've partnered with dozens of companies to provide exclusive
                licensing and custom-tailored access.
              </p>
            </div>
          </div>
          <button className="w-full md:w-auto h-12 md:h-14 px-6 md:px-8 text-base font-semibold text-white bg-zinc-800 rounded-xl shadow-button hover:bg-zinc-700 transition-colors flex justify-center items-center gap-3.5 overflow-hidden cursor-pointer group flex-shrink-0">
            Let’s Talk
            <div className="w-5 h-full relative flex justify-center items-center">
              <div className="text-white left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 absolute inline-flex flex-col justify-center items-center overflow-hidden">
                <div className="flex-1 relative flex justify-center items-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight2 size={20} />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};
export default PricingSection;
