import { ChevronRight } from 'lucide-react';

export const FloatingButton = () => (
  <button className="z-20 mx-auto flex h-11 transform items-center gap-3.5 rounded-xl border border-white/10 bg-zinc-800 px-4 shadow-2xl transition-colors hover:bg-zinc-700">
    <div className="flex items-center gap-1.5">
      <span className="font-sans text-sm font-medium text-white">Browse All</span>
      <span className="text-sm font-normal text-white/30">-</span>
      <span className="font-sans text-sm font-medium text-white/70">Components & Blocks</span>
    </div>
    <ChevronRight className="h-4 w-4 text-white/70" />
  </button>
);
