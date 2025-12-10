export const IntersectionMarker = ({ className }: { className?: string }) => (
  <div className={`absolute w-1.5 h-1.5 z-10 pointer-events-none ${className}`}>
    <div className="w-full h-full relative overflow-hidden shadow-[0px_0px_0px_6px_rgba(25,25,25,1.00)] bg-zinc-900 rounded-full flex items-center justify-center">
      {/* Render Cross/Plus or Dot based on CSS classes passed or generic shape */}
      <div className="w-1.5 h-1.5 bg-neutral-800" />
    </div>
  </div>
);
