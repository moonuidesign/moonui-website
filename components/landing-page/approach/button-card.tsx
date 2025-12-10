export const ButtonCard = ({
  color,
  label,
}: {
  color: string;
  label: string;
}) => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-white p-4">
    <button
      className={`px-6 py-3 rounded-lg text-white shadow-xl ${color} font-medium tracking-wide transform active:scale-95 transition-all`}
    >
      {label}
    </button>
    <div className="mt-4 flex gap-2">
      <div className={`w-2 h-2 rounded-full ${color} opacity-40`}></div>
      <div className={`w-2 h-2 rounded-full ${color} opacity-20`}></div>
    </div>
  </div>
);
