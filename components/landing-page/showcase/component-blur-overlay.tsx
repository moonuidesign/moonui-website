export const GradientBlurOverlay = () => {
  const layers = [
    { bottom: 128, blur: '0.5px' },
    { bottom: 112, blur: '1px' },
    { bottom: 96, blur: '1.5px' },
    { bottom: 80, blur: '2px' },
    { bottom: 64, blur: '2.5px' },
    { bottom: 48, blur: '3px' },
    { bottom: 32, blur: 'sm' }, // backdrop-blur-sm
    { bottom: 16, blur: '5px' },
    { bottom: 0, blur: '6px' }, // max blur
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full h-[520px] pointer-events-none z-10">
      {/* Base Fade */}
      <div className="absolute inset-0  h-[820px] bg-gradient-to-b from-transparent to-[#E8E8E8] via-[#E8E8E8]/80"></div>

      {/* Stacked Blur Layers */}
      {layers.map((layer, index) => (
        <div
          key={index}
          className="absolute w-full h-4 bg-gradient-to-b from-black/0 to-transparent"
          style={{
            bottom: `${layer.bottom}px`,
            backdropFilter: `blur(${layer.blur})`,
            WebkitBackdropFilter: `blur(${layer.blur})`,
          }}
        />
      ))}
    </div>
  );
};
