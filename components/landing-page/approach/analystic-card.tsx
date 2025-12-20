import { BarChart } from 'lucide-react';

export const AnalyticsCard = () => (
  <div className="p-5 w-full h-full bg-slate-800 text-white flex flex-col justify-between">
    <div className="flex justify-between items-center">
      <span className="text-xs text-slate-400">Total Revenue</span>
      <BarChart size={16} className="text-emerald-400" />
    </div>
    <div className="text-[28px] md:text-[30px] font-bold">$45,231</div>
    <div className="flex gap-1 items-end h-12 pb-2">
      {[40, 70, 30, 85, 50, 65].map((h, i) => (
        <div
          key={i}
          style={{ height: `${h}%` }}
          className="flex-1 bg-emerald-500/80 rounded-t-sm hover:bg-emerald-400 transition-colors"
        ></div>
      ))}
    </div>
  </div>
);
