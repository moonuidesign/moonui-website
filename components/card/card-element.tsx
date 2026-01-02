import React from 'react';
export type TierType = 'free' | 'pro' | 'pro_plus';

// 1. Badge "New"
export const NewBadge = () => (
  <div className="ml-2 inline-flex flex-col items-start justify-start rounded-md bg-orange-600 px-1.5 py-1 shadow-sm">
    <div className="font-['Inter'] text-[10px] leading-[10px] font-semibold text-white">New</div>
  </div>
);

export const TierIndicator = ({ tier }: { tier: TierType }) => {
  if (tier === 'free') {
    return <span className="font-['Inter'] text-sm font-medium text-zinc-500">Free</span>;
  }

  const isProPlus = tier === 'pro_plus';

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Icon Bar Warna-Warni */}
      <div className="flex items-center gap-[1px]">
        <div className="h-2.5 w-3.5 rounded-[1px] bg-sky-400" />
        <div className="h-2.5 w-1 rounded-[1px] bg-amber-400" />
        <div className="h-2 w-1.5 rounded-[1px] bg-yellow-500" />
        {isProPlus && <div className="h-2 w-1 rounded-[1px] bg-purple-500" />} {/* Pembeda Pro+ */}
        <div className="h-2 w-1 rounded-[1px] bg-orange-300" />
      </div>

      <div
        className={`justify-center text-right font-['Inter'] text-sm leading-6 font-semibold ${
          isProPlus ? 'text-indigo-600' : 'text-[#3D3D3D]'
        }`}
      >
        {isProPlus ? 'Pro+' : 'Pro'}
      </div>
    </div>
  );
};

// 3. Tombol Aksi (Reusable)
interface ActionBtnProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export const ActionButton: React.FC<ActionBtnProps> = ({ label, icon, onClick }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className="flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-100 bg-white px-3 shadow-lg transition-all duration-200 hover:scale-105"
  >
    <span className="flex items-center justify-center text-[#3D3D3D]">{icon}</span>
    <span className="font-['Inter'] text-xs font-medium text-[#3D3D3D]">{label}</span>
  </button>
);
