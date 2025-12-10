import { ReactNode } from 'react';

export interface FeatureItem {
  title: string;
  description: string;
  icon: ReactNode;
}

export interface FeaturesSectionProps {
  badgeText?: string;
  title?: string;
  subtitle?: ReactNode;
  features: FeatureItem[];
  className?: string;
}
export const FeatureCard = ({ title, description, icon }: FeatureItem) => {
  return (
    <div className="w-full py-4 h-full gap-2 lg:p-4 flex flex-row  lg:flex-col items-start lg:items-center justify-start md:min-h-[180px]">
      <div className="lg:w-6 w-[18px] h-[18px] lg:h-6 relative mb-5 flex items-start justify-start lg:items-center lg:justify-center">
        {icon}
      </div>
      <div className="flex flex-col w-full items-start lg:items-center justify-start gap-[0.5px]">
        <div className="text-left lg:text-center text-white text-[14px] lg:text-base font-medium font-['Inter'] leading-6">
          {title}
        </div>
        <div className="text-left lg:text-center text-neutral-500 text-[12px] lg:text-sm font-normal font-['Inter'] leading-5 md:max-w-[250px]">
          {description}
        </div>
      </div>
    </div>
  );
};
