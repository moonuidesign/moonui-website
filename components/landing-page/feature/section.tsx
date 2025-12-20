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
      className={`w-full md:w-3xl lg:w-full max-w-[1440px] mt-10 md:mt-0 h-fit mx-auto  px-1 lg:p-20  ${className}`}
    >
      {/* Main Container Card */}
      <div className="w-full bg-zinc-900 rounded-[28px] md:rounded-[40px]  shadow-sm py-8 px-6 lg:p-8 md:p-16 flex flex-col gap-4 overflow-hidden relative">
        {/* Header Section */}
        <div className="w-full flex items-start lg:items-center gap-4 relative z-10">
          <div className="flex-1 h-px bg-gradient-to-r hidden md:block from-transparent via-neutral-800 to-transparent" />
          <div className="h-8 px-3 py-1.5 bg-orange-600 rounded-lg shadow-sm flex items-start md:items-center gap-1.5">
            <div className="w-4 h-4 relative">
              <div className="w-3.5 h-3.5 border border-white rounded-sm" />
            </div>
            <span className="text-white text-sm font-medium font-['Inter']">
              {badgeText}
            </span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r hidden md:block from-transparent via-neutral-800 to-transparent" />
        </div>

        {/* Title & Subtitle */}
        <div className="flex flex-col items-start justify-start lg:items-center gap-4 z-10 relative">
          <h2 className="text-left lg:text-center  text-white text-[28px] md:text-[28px] font-semibold font-jakarta leading-tight">
            {title}
          </h2>
          <div className="max-w-[564px] text-[14px] text-left lg:text-center text-neutral-500 font-['Inter'] leading-7">
            {subtitle || (
              <>
                500+{' '}
                <span className="text-neutral-400 font-medium">flexible</span>{' '}
                components with{' '}
                <span className="text-neutral-400 font-medium">
                  developer-friendly
                </span>
                , comprehensive codebase.
              </>
            )}
          </div>
        </div>

        {/* Grid Container */}
        <div className="relative w-full max-w-[1152px] mx-auto">
          {/* Background Grid Lines (Absolute Overlay) */}
          <div className="absolute  inset-0 pointer-events-none hidden md:block">
            {/* Vertical Lines */}
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-neutral-800 to-transparent" />
            <div className="absolute right-1/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-neutral-800 to-transparent" />

            {/* Horizontal Lines */}
            <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

            {/* Intersections (Custom markers from design) */}
            <IntersectionMarker className="left-[33.33%] top-[33.33%] -translate-x-1/2 -translate-y-1/2" />
            <IntersectionMarker className="right-[33.33%] top-[33.33%] translate-x-1/2 -translate-y-1/2" />
            <IntersectionMarker className="left-[33.33%] top-[66.66%] -translate-x-1/2 -translate-y-1/2" />
            <IntersectionMarker className="right-[33.33%] top-[66.66%] translate-x-1/2 -translate-y-1/2" />
          </div>

          {/* Actual Grid Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-y-0 md:gap-x-0 relative z-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`
      md:py-6 lg:py-12  md:px-3 lg:px-4
     
    `}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
