import React from 'react';

// Tipe data untuk paket harga
interface PricePlan {
  title: string;
  subtitle: string;
  price: string;
  priceDetail: string;
  features: string[];
  buttonText: string;
  isDark?: boolean;
  gradient: string;
}

const plans: PricePlan[] = [
  {
    title: 'MoonUI Free',
    subtitle: 'Login—start Downloading',
    price: '$0',
    priceDetail: 'one—free forever',
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
    price: '$499',
    priceDetail: 'one—annual payment',
    features: [
      'Time-Limited Offers',
      '200+ Selected Items',
      'Constantly Growing Library',
      'Premium Download Speed (CDN)',
      'Unlimited Downloads',
      '100% Commercial Use',
    ],
    buttonText: 'Become a Pro',
    gradient: 'from-gray-200 to-stone-300',
  },
  {
    title: 'MoonUI Pro Plus',
    subtitle: 'Life—time Access',
    price: '$2499',
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

const PricingSection = () => {
  return (
    <section className="w-full py-16 px-4 md:px-8  flex flex-col gap-16 items-center">
      {/* --- HEADER --- */}
      <div className="flex flex-col items-center text-center gap-4">
        <div className="px-4 py-1.5 bg-orange-600 rounded-lg shadow-md flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="text-white text-sm font-medium">Pricing</span>
        </div>

        <h2 className="max-w-3xl text-zinc-800 text-3xl md:text-5xl font-semibold leading-tight">
          Elevate your business with premium <br className="hidden md:block" />{' '}
          design assets library
        </h2>

        <p className="max-w-xl text-neutral-500 text-base md:text-lg">
          <span className="text-neutral-700 font-medium">Customizable</span>{' '}
          components & templates that seamlessly{' '}
          <span className="text-neutral-700 font-medium">adapt</span> to your
          project needs.
        </p>
      </div>

      {/* --- PRICING CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`flex flex-col rounded-[32px] overflow-hidden border border-zinc-100 shadow-xl transition-transform hover:scale-[1.02] 
              ${
                plan.isDark
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-800'
              }`}
          >
            {/* Gradient Header */}
            <div
              className={`h-32 w-full p-6 bg-gradient-to-br ${plan.gradient} flex flex-col justify-end`}
            >
              <h3
                className={`text-2xl font-bold ${
                  plan.isDark || index === 0 ? 'text-white' : 'text-zinc-800'
                }`}
              >
                {plan.title}
              </h3>
              <p
                className={`text-sm opacity-80 ${
                  plan.isDark || index === 0 ? 'text-white' : 'text-zinc-800'
                }`}
              >
                {plan.subtitle}
              </p>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col flex-1 gap-6">
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
                      className={`text-sm font-medium ${
                        plan.isDark ? 'text-neutral-300' : 'text-neutral-500'
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <div className="text-4xl font-bold leading-none">
                  {plan.price}
                </div>
                <div
                  className={`text-sm mt-1 ${
                    plan.isDark ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                >
                  {plan.priceDetail}
                </div>
              </div>

              <button
                className={`w-full py-4 rounded-xl font-semibold transition-all shadow-lg active:scale-95
                ${
                  plan.isDark
                    ? 'bg-white text-zinc-900 hover:bg-neutral-100'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- CUSTOM SOLUTION BANNER --- */}
      <div className="w-full max-w-7xl">
        <div className="w-full bg-white border border-zinc-100 rounded-[30px] p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {/* Placeholder for images */}
            <div className="w-24 h-16 bg-gradient-to-br from-gray-200 to-stone-300 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src="https://placehold.co/150x100"
                alt="Partner"
                className="w-full h-full object-cover"
              />
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
          <button className="whitespace-nowrap bg-zinc-900 text-white px-8 py-4 rounded-2xl font-medium hover:bg-zinc-800 transition-all shadow-md active:scale-95">
            Let’s Talk —&gt;
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
