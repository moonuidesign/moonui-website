import { TierType } from '@/contexts';
import React from 'react';
import { ActionButton, NewBadge, TierIndicator } from './card-element';

interface GradientCardProps {
  title: string;
  cssBackground: string; // Contoh: "linear-gradient(to right, #ff0099, #493240)"
  tier: TierType;
  isNew?: boolean;
  onDownload: () => void;
  onCopyCSS?: () => void;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  title,
  cssBackground,
  tier,
  isNew,
  onDownload,
  onCopyCSS,
}) => {
  return (
    <div className="group w-full flex flex-col justify-start items-start gap-3">
      {/* Container Gradient (Tanpa <img>, pakai div background) */}
      <div className="self-stretch h-64 relative bg-white rounded-2xl shadow-[0px_0px_0px_1px_rgba(51,51,51,0.10)] shadow-[0px_48px_48px_-24px_rgba(51,51,51,0.04)] border-t-[5px] border-white overflow-hidden transition-all duration-300 group-hover:shadow-xl">
        {/* Render Warna Gradient */}
        <div
          className="w-full h-full rounded-lg"
          style={{ background: cssBackground }}
        />

        {/* Overlay Hover */}
        <div className="absolute inset-0 bg-zinc-300/60 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-2 z-10">
          {/* Tombol Download (Spesifik untuk Gradient) */}
          <ActionButton
            label="Download Image"
            onClick={onDownload}
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
          />
        </div>
      </div>
      <div className="self-stretch px-2 inline-flex justify-between items-center">
        <div className="flex justify-start items-center">
          <div className="text-[#3D3D3D] text-sm font-medium font-['Inter'] leading-6">
            {title}
          </div>
          {isNew && <NewBadge />}
        </div>
        <TierIndicator tier={tier} />
      </div>
    </div>
  );
};
