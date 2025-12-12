import { TierType } from '@/contexts';
import React from 'react';
import { ActionButton, NewBadge, TierIndicator } from './card-element';

interface ComponentCardProps {
  title: string;
  thumbnail: string;
  tier: TierType;
  isNew?: boolean;
  onCopyFigma?: () => void;
  onCopyFramer?: () => void;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  thumbnail,
  tier,
  isNew,
  onCopyFigma,
  onCopyFramer,
}) => {
  return (
    <div className="group w-96 flex flex-col justify-start items-start gap-3">
      {/* Container Gambar */}
      <div className="self-stretch h-64 relative bg-white rounded-2xl shadow-[0px_0px_0px_1px_rgba(51,51,51,0.10)] shadow-[0px_48px_48px_-24px_rgba(51,51,51,0.04)] shadow-[0px_12px_12px_-6px_rgba(51,51,51,0.04)] border-t-[5px] border-white overflow-hidden transition-all duration-300 group-hover:shadow-xl">
        <img
          className="w-full h-full object-cover rounded-lg p-[1px]"
          src={thumbnail}
          alt={title}
        />

        {/* Overlay Hover */}
        <div className="absolute inset-0 bg-zinc-300/80 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-2 z-10">
          {/* Tombol Copy Figma */}
          {onCopyFigma && (
            <ActionButton
              label="Copy to Figma"
              onClick={onCopyFigma}
              icon={
                <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
                  <path
                    d="M2.99951 18C4.65637 18 5.99951 16.6569 5.99951 15V12H2.99951C1.34266 12 -0.000488281 13.3431 -0.000488281 15C-0.000488281 16.6569 1.34266 18 2.99951 18Z"
                    fill="#0ACF83"
                  />
                  <path
                    d="M0 9C0 7.34315 1.34315 6 3 6H6V12H3C1.34315 12 0 10.6569 0 9Z"
                    fill="#A259FF"
                  />
                  <path
                    d="M0 3C0 1.34315 1.34315 0 3 0H6V6H3C1.34315 6 0 4.6569 0 3Z"
                    fill="#F24E1E"
                  />
                  <path
                    d="M6 0H9C10.6569 0 12 1.34315 12 3C12 4.6569 10.6569 6 9 6H6V0Z"
                    fill="#FF7262"
                  />
                  <path
                    d="M12 9C12 10.6569 10.6569 12 9 12H6V6H9C10.6569 6 12 7.34315 12 9Z"
                    fill="#1ABCFE"
                  />
                </svg>
              }
            />
          )}

          {/* Tombol Copy Framer */}
          {onCopyFramer && (
            <ActionButton
              label="Copy to Framer"
              onClick={onCopyFramer}
              icon={
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M0 0H12V4.28571L8.57143 4.28571L12 7.71429V12H0V7.71429L3.42857 7.71429L0 4.28571V0Z"
                    fill="black"
                  />
                </svg>
              }
            />
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="self-stretch px-2 inline-flex justify-between items-center">
        <div className="flex justify-start items-center">
          <div className="text-zinc-800 text-sm font-medium font-['Inter'] leading-6 truncate max-w-[180px]">
            {title}
          </div>
          {isNew && <NewBadge />}
        </div>
        <TierIndicator tier={tier} />
      </div>
    </div>
  );
};
