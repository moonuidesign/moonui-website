export const ButtonCard = ({ color, label }: { color: string; label: string }) => (
  <div className="flex h-full w-full flex-col items-center justify-center bg-white p-4">
    <button
      className={`rounded-lg px-6 py-3 text-white shadow-xl ${color} transform font-medium tracking-wide transition-all`}
    >
      {label}
    </button>
    <div className="mt-4 flex gap-2">
      <div className={`h-2 w-2 rounded-full ${color} opacity-40`}></div>
      <div className={`h-2 w-2 rounded-full ${color} opacity-20`}></div>
    </div>
  </div>
);
