import { ConvertCard } from 'iconsax-reactjs';
import { FeatureItem } from './feature-card';
import { FeaturesSection } from './section';

// Helper for the custom CSS icons provided in your snippet
const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[18px] h-[18px] md:w-6 md:h-6 relative">{children}</div>
);

export default function Feature() {
  const featuresData: FeatureItem[] = [
    {
      title: '180+ Components',
      description: '180+ versatile UI elements for rapid development.',
      icon: <ConvertCard />,
    },
    {
      title: 'Production Ready',
      description: 'Pre-optimized code for instant project deployment.',
      icon: <ConvertCard />,
    },
    {
      title: 'Figma File',
      description: 'Comprehensive design kit for seamless UI/UX workflow.',
      icon: (
        <IconWrapper>
          <div className="w-4 h-4 absolute top-[4px] left-[4px] outline outline-[1.5px] outline-orange-600"></div>
        </IconWrapper>
      ),
    },
    {
      title: 'Customizable',
      description: 'Highly flexible system for unique brand expression.',
      icon: (
        <IconWrapper>
          <div className="w-4 h-4 absolute top-[3px] left-[4px] outline outline-[1.5px] outline-orange-600"></div>
          <div className="w-1.5 h-1.5 absolute top-[9px] left-[9px] outline outline-[1.5px] outline-orange-600"></div>
        </IconWrapper>
      ),
    },
    {
      title: 'Responsive',
      description: 'Adaptive layouts for multi-device compatibility.',
      icon: (
        <IconWrapper>
          <div className="w-5 h-4 absolute top-[4px] left-[2px] outline outline-[1.5px] outline-orange-600"></div>
        </IconWrapper>
      ),
    },
    {
      title: 'Easy for Devs',
      description: 'Intuitive framework for rapid and efficient development.',
      icon: (
        <IconWrapper>
          <div className="w-5 h-5 absolute top-[2.5px] left-[2.5px] outline outline-[1.5px] outline-orange-600"></div>
        </IconWrapper>
      ),
    },
    {
      title: 'Dark Mode',
      description: 'Effortless integration for enhanced user experience.',
      icon: (
        <IconWrapper>
          <div className="w-5 h-5 absolute top-[2px] left-[2px] bg-orange-600"></div>
          <div className="w-1.5 h-1.5 absolute top-[3px] left-[14px] bg-orange-600"></div>
        </IconWrapper>
      ),
    },
    {
      title: 'TypeScript',
      description: 'Strong typing for enhanced code maintainability.',
      icon: (
        <IconWrapper>
          <div className="w-4 h-4 absolute top-[3.75px] left-[3.75px] outline outline-[1.5px] outline-orange-600"></div>
        </IconWrapper>
      ),
    },
    {
      title: 'Accessible',
      description: 'WCAG-compliant design for inclusive user access.',
      icon: (
        <IconWrapper>
          <div className="w-5 h-5 absolute top-[2.75px] left-[2.75px] outline outline-[1.5px] outline-orange-600"></div>
          <div className="w-0.5 h-[5px] absolute top-[11.25px] left-[12px] outline outline-[1.5px] outline-orange-600"></div>
          <div className="w-1.5 h-2 absolute top-[7.25px] left-[8.75px] outline outline-[1.5px] outline-orange-600"></div>
        </IconWrapper>
      ),
    },
  ];

  return (
    <div>
      <FeaturesSection
        features={featuresData}
        subtitle={
          <span>
            500+ <span className="text-neutral-400 font-medium">flexible</span>{' '}
            components with{' '}
            <span className="text-neutral-400 font-medium">
              developer-friendly
            </span>{' '}
            codebase.
          </span>
        }
      />
    </div>
  );
}
