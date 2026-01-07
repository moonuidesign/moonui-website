import { ArrowRight2 } from 'iconsax-reactjs';

export const FloatingButton = () => (
  <button className="group relative z-[110] flex h-11 cursor-pointer items-center gap-3 rounded-[13px] bg-[#2E2E2E] px-5 text-white shadow-[0_8px_16px_rgba(0,0,0,0.1),0_0_0_1px_#000] transition-colors hover:bg-black">
    <div className="flex items-center gap-1.5">
      <span className="font-sans text-sm font-medium text-white">Browse All</span>
      <span className="text-sm font-normal text-white/30">-</span>
      <span className="font-sans text-sm font-medium text-white/70">Components & Blocks</span>
    </div>
    <div className="relative flex h-full w-5 items-center justify-center">
      <div className="absolute top-0 top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center overflow-hidden text-white">
        <div className="relative flex flex-1 items-center justify-center transition-transform group-hover:translate-x-1">
          <ArrowRight2 size={18} />
        </div>
      </div>
    </div>
  </button>
);
