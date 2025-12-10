export const ComponentBadge = () => (
  // Menggunakan shadow dan border yang lebih halus agar cocok di background putih/abu
  <div className="h-7 md:h-8 pl-1.5 pr-2.5 py-1 bg-white rounded-lg shadow-sm border border-gray-200 inline-flex items-center gap-1.5">
    <div className="w-4 h-4 relative">
      {/* Icon kotak simple */}
      <div className="w-3.5 h-3 left-[1.8px] top-[3.3px] absolute bg-gray-400 rounded-[1px]"></div>
      <div className="w-px h-3 left-[8.5px] top-[3.3px] absolute bg-white"></div>
    </div>

    <span className="text-gray-700 text-sm font-medium font-sans leading-5">
      Components & Blocks
    </span>

    <div className="px-[5px] py-[3px] bg-orange-50 rounded-[5px] border border-orange-200 ml-1">
      <span className="text-orange-600 text-[10px] font-bold font-sans leading-none block">
        PRO
      </span>
    </div>
  </div>
);
