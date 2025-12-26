import React, { useRef, useState, useMemo } from 'react';
import { Fingerprint, Activity, Lock, X } from 'lucide-react';
import { motion } from 'framer-motion';

// Kita perlu mendefinisikan properti CSS khusus agar TypeScript tidak komplain
declare module 'react' {
  interface CSSProperties {
    '--mouse-x'?: string | number;
    '--mouse-y'?: string | number;
    '--roughness'?: string | number;
  }
}

interface ReflectiveCardProps {
  imageSrc?: string;
  name?: string;
  role?: string;
  email?: string;
  maskRadius?: number; // Ukuran area senter (flashlight)
  blurStrength?: number;
  metalness?: number;
  roughness?: number;
  displacementStrength?: number;
  specularConstant?: number;
  grayscale?: number;
  className?: string;
  style?: React.CSSProperties;
  backContent?: React.ReactNode;
}

const ReflectiveCard: React.FC<ReflectiveCardProps> = ({
  imageSrc = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
  maskRadius = 120, // Radius default area reflektif
  blurStrength = 4,
  metalness = 0.9,
  roughness = 0.5,
  displacementStrength = 15,
  specularConstant = 1.5,
  grayscale = 1,
  className = '',
  style = {},
  name,
  role,
  backContent,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 160, y: 250 });
  const [isHovering, setIsHovering] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // ID unik untuk filter agar tidak bentrok jika ada banyak card
  const filterId = useMemo(
    () => `metallic-displacement-${Math.random().toString(36).substr(2, 9)}`,
    [],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    if (!isHovering) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const hoverSaturation = 1 - Math.max(0, Math.min(1, grayscale));

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={`relative w-full h-[400px] rounded-[20px] [perspective:1000px] cursor-pointer group ${className}`}
      style={style}
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d] transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
      >
        {/* =================================================================
            FRONT FACE
        ================================================================= */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[20px] overflow-hidden shadow-2xl bg-white"
        >
          {/* --- DEFINISI SVG FILTER --- */}
          <svg
            className="absolute w-0 h-0 pointer-events-none opacity-0"
            aria-hidden="true"
          >
            <defs>
              <filter
                id={filterId}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feTurbulence
                  type="turbulence"
                  baseFrequency="0.02"
                  numOctaves="3"
                  result="noise"
                />
                <feColorMatrix
                  in="noise"
                  type="luminanceToAlpha"
                  result="noiseAlpha"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={displacementStrength}
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="rippled"
                />
                <feSpecularLighting
                  in="noiseAlpha"
                  surfaceScale={displacementStrength}
                  specularConstant={specularConstant}
                  specularExponent="30"
                  lightingColor="#ffffff"
                  result="light"
                >
                  <fePointLight x={mousePos.x} y={mousePos.y} z="150" />
                </feSpecularLighting>
                <feComposite
                  in="light"
                  in2="rippled"
                  operator="in"
                  result="light-effect"
                />
                <feBlend
                  in="light-effect"
                  in2="rippled"
                  mode="screen"
                  result="metallic-result"
                />
              </filter>
            </defs>
          </svg>

          {/* LAYER 1: GAMBAR NORMAL */}
          <div className="absolute inset-0 z-0">
            <img
              src={imageSrc}
              alt="Original Identity"
              className="w-full h-full object-cover"
            />
          </div>

          {/* LAYER 2: MASKED REFLECTIVE AREA */}
          <div
            className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ease-out"
            style={{
              '--mouse-x': `${mousePos.x}px`,
              '--mouse-y': `${mousePos.y}px`,
              opacity: isHovering ? 1 : 0,
              maskImage: `radial-gradient(circle ${maskRadius}px at var(--mouse-x) var(--mouse-y), black 40%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(circle ${maskRadius}px at var(--mouse-x) var(--mouse-y), black 40%, transparent 100%)`,
            }}
          >
            <img
              src={imageSrc}
              alt="Reflective Identity"
              className="w-full h-full object-cover absolute inset-0"
              style={{
                filter: `saturate(${hoverSaturation}) contrast(120%) brightness(110%) blur(${blurStrength}px) url(#${filterId})`,
                transform: 'scale(1.02)',
              }}
            />
            <div
              className="absolute inset-0 mix-blend-overlay opacity-[var(--roughness)]"
              style={{ '--roughness': roughness } as React.CSSProperties}
            >
              <div className="w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%20400%20400%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27noiseFilter%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.9%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url(%23noiseFilter)%27%2F%3E%3C%2Fsvg%3E')] opacity-50" />
            </div>
            <div
              className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.3)_100%)] mix-blend-soft-light"
              style={{ opacity: metalness }}
            />
          </div>

          {/* UI CONTENT (Front) */}
          <div className="absolute inset-0 rounded-[20px] p-[1px] bg-gradient-to-br from-white/30 via-transparent to-white/20 z-30 pointer-events-none" />
          <div className="relative z-40 h-full flex flex-col justify-between p-4 text-white pointer-events-none">
            <div className="flex justify-between items-center border-b border-white/20 pb-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] px-2 py-1 bg-black/40 backdrop-blur-md rounded border border-white/10">
                <Lock size={14} className="opacity-80" />
                <span>SECURE ACCESS</span>
              </div>
              <Activity className="opacity-80" size={20} />
            </div>
            <div className="flex-1 flex flex-col justify-end items-center text-center gap-6 mb-4 drop-shadow-lg"></div>
            <div className="flex justify-between items-end border-t border-white/20 pt-2 drop-shadow-md">
              <div className="text-left">
                <h2 className="text-[14px] font-bold tracking-[0.05em] m-0 mb-2">
                  {name}
                </h2>
                <p className="text-[10px] tracking-[0.2em] opacity-80 m-0 uppercase font-semibold">
                  {role}
                </p>
              </div>
              <div className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer pointer-events-auto">
                <Fingerprint size={32} className="opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            BACK FACE
        ================================================================= */}
        <div
          className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[20px] overflow-hidden shadow-xl bg-zinc-900 border border-zinc-800"
        >
          {/* Back Content Container */}
          <div className="relative w-full h-full p-6 flex flex-col text-white">
            {/* Gradient Background for Back */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 opacity-50 z-0" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlip();
                  }}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={16} className="text-zinc-400" />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                {backContent || (
                  <div className="text-zinc-500 text-sm">
                    No details available.
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 mt-auto">
                <div className="flex items-center justify-between opacity-60 text-[10px] tracking-widest uppercase">
                  <span>MoonUI</span>
                  <span>Team</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReflectiveCard;
