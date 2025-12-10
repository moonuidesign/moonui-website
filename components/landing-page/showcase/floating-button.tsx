import { ChevronRight } from 'lucide-react';

export const FloatingButton = () => (
  <button className="h-11 px-4 bg-zinc-800 rounded-xl shadow-2xl border border-white/10 flex items-center gap-3.5 hover:bg-zinc-700 transition-colors z-20 mx-auto active:scale-95 transform">
    <div className="flex items-center gap-1.5">
      <span className="text-white text-sm font-medium font-sans">
        Browse All
      </span>
      <span className="text-white/30 text-sm font-normal">-</span>
      <span className="text-white/70 text-sm font-medium font-sans">
        Components & Blocks
      </span>
    </div>
    <ChevronRight className="w-4 h-4 text-white/70" />
  </button>
);
