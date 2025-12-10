'client use';

export const GoProCard = () => {
  return (
    <div className="w-full px-2 pt-6 pb-3 bg-zinc-900 rounded-[20px] shadow-card-sm flex flex-col items-center gap-3 text-center overflow-hidden relative">
      {/* Abstract Decoration (CSS Art based on your snippet) */}
      <div className="flex flex-wrap justify-center gap-1 scale-75 opacity-80">
        <div className="w-8 h-6 bg-sky-400" />
        <div className="w-2 h-2 bg-amber-400" />
        <div className="w-4 h-5 bg-yellow-500" />
        <div className="w-4 h-5 bg-orange-300" />
      </div>

      <div className="flex flex-col gap-1 z-10">
        <h3 className="text-white text-lg font-extrabold font-['Plus_Jakarta_Sans']">
          Go Pro!
        </h3>
        <p className="text-neutral-300 text-xs font-normal font-['Inter'] px-2 leading-tight">
          Instantly access 250+ premium Figma & Framer resources.
        </p>
      </div>

      <button className="w-full py-1.5 bg-white rounded-xl shadow-sm hover:bg-gray-100 transition-colors mt-1">
        <span className="text-neutral-800 text-xs font-bold font-['Inter']">
          Get it now
        </span>
      </button>
    </div>
  );
};
