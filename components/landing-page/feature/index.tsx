import { FeatureItem } from './feature-card';
import { FeaturesSection } from './section';
import Image from 'next/image';

export default function Feature() {
  const featuresData: FeatureItem[] = [
    {
      title: '180+ Components',
      description: '180+ versatile UI elements for rapid development.',
      icon: (
        <Image
          src="/SVG.svg"
          width={100}
          height={100}
          className=" size-7 md:size-6 "
          alt="Logo Feature 1"
        />
      ),
    },
    {
      title: 'Production Ready',
      description: 'Pre-optimized code for instant project deployment.',
      icon: (
        <Image
          src="/SVG-1.svg"
          width={100}
          height={100}
          className=" size-7 md:size-6 "
          alt="Logo Feature 1"
        />
      ),
    },
    {
      title: 'Figma File',
      description: 'Comprehensive design kit for seamless UI/UX workflow.',
      icon: (
        <Image
          src="/SVG-2.svg"
          width={100}
          height={100}
          className=" size-7 md:size-6 "
          alt="Logo Feature 1"
        />
      ),
    },
    {
      title: 'Customizable',
      description: 'Highly flexible system for unique brand expression.',
      icon: (
        <Image
          src="/SVG-3.svg"
          width={100}
          height={100}
          className=" size-7 md:size-6 "
          alt="Logo Feature 1"
        />
      ),
    },
    {
      title: 'Responsive',
      description: 'Adaptive layouts for multi-device compatibility.',
      icon: (
        <Image
          src="/SVG-4.svg"
          width={100}
          height={100}
          className=" size-7 md:size-6 "
          alt="Logo Feature 1"
        />
      ),
    },
    {
      title: 'Easy for Devs',
      description: 'Intuitive framework for rapid and efficient development.',
      icon: (
        <Image
          src="/SVG-5.svg"
          width={100}
          height={100}
          className=" size-7 md:size-6 "
          alt="Logo Feature 1"
        />
      ),
    },
    {
      title: 'Dark Mode',
      description: 'Effortless integration for enhanced user experience.',
      icon: (
        <Image
          src="/SVG-6.svg"
          width={100}
          height={100}
          className=" size-7 md:size-6 "
          alt="Logo Feature 1"
        />
      ),
    },
    {
      title: 'TypeScript',
      description: 'Strong typing for enhanced code maintainability.',
      icon: (
        <Image
          src="/SVG-7.svg"
          width={100}
          height={100}
          className=" size-7 md:size-6 "
          alt="Logo Feature 1"
        />
      ),
    },
    {
      title: 'Accessible',
      description: 'WCAG-compliant design for inclusive user access.',
      icon: (
        <Image
          src="/SVG-8.svg"
          width={100}
          height={100}
          className=" size-7 md:size-6 "
          alt="Logo Feature 1"
        />
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
