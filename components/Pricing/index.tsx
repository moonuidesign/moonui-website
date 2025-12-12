import React from 'react';
import Link from 'next/link'; // 1. Import Link
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';

// Setup Font
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'] });

// --- Tipe Data ---
type PricingTier = {
  title: string;
  subTitle: string;
  price: string;
  period: string;
  description?: string;
  features: string[];
  gradient: string;
  cardBg: string;
  textColor: string;
  buttonColor: string;
  buttonText: string;
  buttonTextColor: string;
  href: string; // 2. Tambah properti href
  isProPlus?: boolean;
};

// --- Data Harga ---
const tiers: PricingTier[] = [
  {
    title: 'MoonUI Free',
    subTitle: 'Login—start Downloading',
    price: '$0',
    period: 'one—free forever',
    features: [
      'Freebie Items Only',
      '5 Downloads / 24 Hours Limit',
      'Delete Anytime',
      '100% Commercial Use',
    ],
    gradient: 'bg-gradient-to-br from-gray-500 to-zinc-900',
    cardBg: 'bg-white',
    textColor: 'text-zinc-800',
    buttonColor: 'bg-zinc-900',
    buttonText: 'Create Free Account',
    buttonTextColor: 'text-white',
    href: '/auth/register', // 3. Contoh Link
  },
  {
    title: 'MoonUI Pro',
    subTitle: 'Subscribe—annual Plan',
    price: '$499',
    period: 'one—annual payment',
    features: [
      'Time-Limited Offers',
      '200+ Selected Items',
      'Constantly Growing Library',
      'Premium Download Speed (CDN)',
      'Unlimited Downloads',
      '100% Commercial Use',
    ],
    gradient: 'bg-gradient-to-br from-gray-200 to-stone-300',
    cardBg: 'bg-white',
    textColor: 'text-zinc-800',
    buttonColor: 'bg-zinc-900',
    buttonText: 'Become a Pro',
    buttonTextColor: 'text-white',
    href: '/checkout/pro', // 3. Contoh Link
  },
  {
    title: 'MoonUI Pro Plus',
    subTitle: 'Life—time Access',
    price: '$2499',
    period: 'one—time payment',
    features: [
      'No Subscriptions',
      '200+ Selected Items',
      'Constantly Growing Library',
      'Premium Download Speed (CDN)',
      'Unlimited Downloads',
      '100% Commercial Use',
    ],
    gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    cardBg: 'bg-zinc-900',
    textColor: 'text-white',
    buttonColor: 'bg-white',
    buttonText: 'Become a Pro Plus',
    buttonTextColor: 'text-neutral-800',
    href: '/checkout/pro-plus', // 3. Contoh Link
    isProPlus: true,
  },
];

// --- Sub-Komponen ---

const CheckIcon = ({ color }: { color: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="20" height="20" rx="6" className={color} />
    <path
      d="M17 9L10 16L7 13"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SparkleIcon = () => (
  <div className="flex gap-1 items-center mr-2">
    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
    <div className="w-1.5 h-1.5 bg-amber-300 rounded-full"></div>
  </div>
);

// --- Komponen Utama ---

export default function PricingSection() {
  return (
    <section
      className={`w-full py-20 flex flex-col items-center gap-10 bg-gray-50 ${jakarta.className}`}
    >
      {/* Header Section */}
      <div className="flex flex-col items-center px-4">
        {/* Badge */}
        <div className="h-8 pl-2 pr-3 py-1.5 bg-orange-600 rounded-lg shadow-sm inline-flex items-center gap-1.5 overflow-hidden mb-4">
          <div className="w-4 h-4 relative flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 2V12M2 7H12"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className={`text-white text-sm font-medium ${inter.className}`}>
            Components & Templates
          </span>
          <div className="px-[5px] py-[3px] bg-white/50 rounded-[5px] flex items-center">
            <span
              className={`text-white text-[10px] font-semibold ${inter.className}`}
            >
              PRO
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-zinc-800 text-4xl md:text-5xl font-semibold leading-tight mb-5">
          Elevate your design with premium
          <br className="hidden md:block" /> components & templates
        </h2>

        {/* Subtitle */}
        <p className={`text-center max-w-2xl ${inter.className}`}>
          <span className="text-neutral-700 font-medium">Customizable</span>
          <span className="text-neutral-500">
            {' '}
            components & templates that seamlessly{' '}
          </span>
          <span className="text-neutral-700 font-medium">adapt</span>
          <span className="text-neutral-500"> to your project needs</span>
        </p>

        {/* Link Browse All */}
        <Link
          href="/components"
          className={`mt-5 text-zinc-900 font-medium hover:underline ${inter.className}`}
        >
          Browse all components →
        </Link>
      </div>

      {/* Pricing Cards Container */}
      <div className="flex flex-col xl:flex-row justify-center items-start gap-10 px-4 w-full max-w-[1400px]">
        {tiers.map((tier, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 w-full max-w-sm mx-auto xl:mx-0"
          >
            <div
              className={`relative h-[532px] w-full rounded-3xl shadow-xl overflow-hidden ${tier.cardBg} border border-zinc-100`}
            >
              {/* Header Card yang Miring */}
              <div
                className={`absolute w-80 h-36 -right-16 top-28 origin-top-left rotate-180 rounded-2xl shadow-lg overflow-hidden ${tier.gradient}`}
              >
                <div className="w-full h-full p-6 flex flex-col justify-end items-end rotate-180 transform translate-x-3 translate-y-3">
                  <h3 className="text-white text-2xl font-bold">
                    {tier.title}
                  </h3>
                  <p
                    className={`text-white text-sm font-medium ${inter.className}`}
                  >
                    {tier.subTitle}
                  </p>
                </div>
              </div>

              {/* List Fitur */}
              <div className="absolute left-6 top-44 flex flex-col gap-2">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckIcon
                      color={tier.isProPlus ? 'fill-white' : 'fill-orange-600'}
                    />
                    <span
                      className={`text-sm font-medium ${inter.className} ${
                        tier.isProPlus ? 'text-neutral-300' : 'text-neutral-500'
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Harga */}
              <div className="absolute left-6 top-[388px] flex items-end gap-2">
                <span
                  className={`${tier.textColor} text-4xl font-bold leading-10`}
                >
                  {tier.price}
                </span>
                <span
                  className={`${
                    tier.isProPlus ? 'text-neutral-400' : 'text-neutral-500'
                  } text-sm font-medium pb-1 ${inter.className}`}
                >
                  {tier.period}
                </span>
              </div>

              {/* Tombol CTA dengan Link */}
              <Link
                href={tier.href}
                className={`absolute left-6 right-6 bottom-9 h-14 ${tier.buttonColor} rounded-2xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
              >
                {tier.isProPlus && <SparkleIcon />}
                <span
                  className={`${tier.buttonTextColor} text-base font-medium ${inter.className}`}
                >
                  {tier.buttonText}
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Bottom (Custom Solution) */}
      <div className="w-full px-4 max-w-[1400px]">
        <div className="relative w-full bg-white rounded-[30px] shadow-xl overflow-hidden min-h-[140px] flex flex-col lg:flex-row items-center p-6 lg:p-0">
          {/* Image Collage Area */}
          <div className="relative w-36 h-28 hidden lg:block m-4 bg-gradient-to-br from-gray-200 to-stone-300 rounded-2xl overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-neutral-300 animate-pulse"></div>
            {/* <Image src="/path-to-image.jpg" alt="Collage" fill className="object-cover" /> */}
          </div>

          {/* Text Content */}
          <div className="flex-1 flex flex-col justify-center text-center lg:text-left gap-2 lg:ml-6 z-10">
            <h3 className="text-zinc-800 text-xl font-bold">
              Need a custom solution for your business? Get in touch!
            </h3>
            <p className={`text-neutral-500 text-sm ${inter.className}`}>
              We've partnered with dozens of companies to provide exclusive
              licensing and custom-tailored access to the Plus library.
            </p>
          </div>

          {/* CTA Button Link */}
          <div className="lg:mr-8 mt-4 lg:mt-0">
            <Link
              href="/contact"
              className="h-14 px-6 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-medium hover:bg-zinc-800 transition-colors"
            >
              Let’s Talk <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
