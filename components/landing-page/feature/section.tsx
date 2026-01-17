import Image from 'next/image';
import { FeatureCard, FeaturesSectionProps } from './feature-card';
import { IntersectionMarker } from './intersection-marker';

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  badgeText = 'Core Features',
  title = "What's inside MoonUI?",
  subtitle,
  features,
  className = '',
}) => {
  return (
    <section
      className={`mx-auto mt-10 h-fit w-full max-w-[1440px] px-1 md:mt-0 md:w-3xl lg:w-full lg:p-20 ${className}`}
    >
      {/* Main Container Card */}
      <div className="relative flex w-full flex-col gap-4 overflow-hidden rounded-[28px] bg-zinc-900 px-6 py-8 shadow-xl md:rounded-[40px] md:px-8 md:pt-16 md:pb-8">
        {/* Header Section */}
        <div className="relative z-10 flex w-full items-start gap-4 lg:items-center">
          <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-neutral-800 to-transparent md:block" />
          <div className="flex h-8 items-start gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 shadow-sm md:items-center">
            <div className="relative h-4 w-4">
              <Image src="/rocket.svg" fill alt="Rocket Icon" className="object-contain" />
            </div>
            <span className="font-['Inter'] text-sm font-medium text-white">{badgeText}</span>
          </div>
          <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-neutral-800 to-transparent md:block" />
        </div>

        {/* Title & Subtitle */}
        <div className="relative z-10 flex flex-col items-start justify-start gap-4 lg:items-center">
          <h2 className="font-jakarta text-left text-[28px] leading-tight font-semibold text-white md:text-[28px] lg:text-center">
            {title}
          </h2>
          <div className="max-w-[564px] text-left font-['Inter'] text-[14px] leading-7 text-neutral-500 lg:text-center">
            {subtitle || (
              <>
                500+ <span className="font-medium text-neutral-400">flexible</span> components with{' '}
                <span className="font-medium text-neutral-400">developer-friendly</span>,
                comprehensive codebase.
              </>
            )}
          </div>
        </div>

        {/* Grid Container */}
        <div className="relative mx-auto w-full max-w-[1152px]">
          {/* Background Grid Lines (Absolute Overlay) */}
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            {/* Vertical Lines */}
            <div className="absolute top-0 bottom-0 left-1/3 w-px bg-gradient-to-b from-transparent via-neutral-800 to-transparent" />
            <div className="absolute top-0 right-1/3 bottom-0 w-px bg-gradient-to-b from-transparent via-neutral-800 to-transparent" />

            {/* Horizontal Lines */}
            <div className="absolute top-1/3 right-0 left-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
            <div className="absolute top-2/3 right-0 left-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

            {/* Intersections (Custom markers from design) */}
            <IntersectionMarker className="top-[33.33%] left-[33.33%] -translate-x-1/2 -translate-y-1/2" />
            <IntersectionMarker className="top-[33.33%] right-[33.33%] translate-x-1/2 -translate-y-1/2" />
            <IntersectionMarker className="top-[66.66%] left-[33.33%] -translate-x-1/2 -translate-y-1/2" />
            <IntersectionMarker className="top-[66.66%] right-[33.33%] translate-x-1/2 -translate-y-1/2" />
          </div>

          {/* Actual Grid Content */}
          <div className="relative z-20 grid grid-cols-1 md:grid-cols-3 md:gap-x-0 md:gap-y-0">
            {features.map((feature, index) => (
              <div key={index} className={`md:px-3 md:py-6 lg:px-4 lg:py-12`}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
