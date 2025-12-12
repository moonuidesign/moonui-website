import { Button } from '@/components/ui';
import { ZoomIn, ZoomOut } from 'lucide-react';

export const ZoomToolbar = ({
  scale,
  setScale,
}: {
  scale: number;
  setScale: (s: number) => void;
}) => (
  <div className="flex items-center gap-1 bg-white rounded-md border border-zinc-200 p-0.5 shadow-sm">
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={() => setScale(Math.max(0.1, scale - 0.1))}
    >
      <ZoomOut className="w-3 h-3" />
    </Button>
    <span className="text-[10px] font-mono w-8 text-center select-none">
      {(scale * 100).toFixed(0)}%
    </span>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={() => setScale(Math.min(2, scale + 0.1))}
    >
      <ZoomIn className="w-3 h-3" />
    </Button>
    <div className="w-[1px] h-3 bg-zinc-200 mx-1"></div>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-auto px-2 text-[10px]"
      onClick={() => setScale(0.4)}
    >
      Fit
    </Button>
  </div>
);
