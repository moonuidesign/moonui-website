import React from 'react';
export type TierType = 'free' | 'pro' | 'pro_plus';

// 1. Badge "New"
export const NewBadge = () => (
  <div className="ml-2 px-1.5 py-1 bg-orange-600 rounded-md shadow-sm inline-flex flex-col justify-start items-start">
    <div className="text-white text-[10px] font-semibold font-['Inter'] leading-[10px]">
      New
    </div>
  </div>
);

export const TierIndicator = ({ tier }: { tier: TierType }) => {
  if (tier === 'free') {
    return (
      <span className="text-sm text-zinc-500 font-medium font-['Inter']">
        Free
      </span>
    );
  }

  const isProPlus = tier === 'pro_plus';

  return (
    <div className="flex justify-center items-center gap-1">
      {/* Icon Bar Warna-Warni */}
      <div className="flex items-center gap-[1px]">
        <div className="w-3.5 h-2.5 bg-sky-400 rounded-[1px]" />
        <div className="w-1 h-2.5 bg-amber-400 rounded-[1px]" />
        <div className="w-1.5 h-2 bg-yellow-500 rounded-[1px]" />
        {isProPlus && (
          <div className="w-1 h-2 bg-purple-500 rounded-[1px]" />
        )}{' '}
        {/* Pembeda Pro+ */}
        <div className="w-1 h-2 bg-orange-300 rounded-[1px]" />
      </div>

      <div
        className={`text-right justify-center text-sm font-semibold font-['Inter'] leading-6 ${
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

export const ActionButton: React.FC<ActionBtnProps> = ({
  label,
  icon,
  onClick,
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className="h-8 px-3 bg-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1.5 border border-zinc-100 cursor-pointer"
  >
    <span className="flex items-center justify-center text-[#3D3D3D]">
      {icon}
    </span>
    <span className="text-[#3D3D3D] text-xs font-medium font-['Inter']">
      {label}
    </span>
  </button>
);
