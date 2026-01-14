import React, { useRef, useState, useMemo } from 'react';
import { Fingerprint, Activity, Lock } from 'lucide-react';
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
      className={`group relative h-[480px] w-full cursor-pointer rounded-[20px] [perspective:1000px] md:h-[435px] ${className}`}
      style={style}
      onClick={handleFlip}
    >
      <motion.div
        className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d]"
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
          className="absolute inset-0 h-full w-full overflow-hidden rounded-[20px] shadow-2xl [backface-visibility:hidden]"
        >
          {/* --- DEFINISI SVG FILTER --- */}
          <svg className="pointer-events-none absolute h-0 w-0 opacity-0" aria-hidden="true">
            <defs>
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feTurbulence
                  type="turbulence"
                  baseFrequency="0.02"
                  numOctaves="3"
                  result="noise"
                />
                <feColorMatrix in="noise" type="luminanceToAlpha" result="noiseAlpha" />
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
                <feComposite in="light" in2="rippled" operator="in" result="light-effect" />
                <feBlend in="light-effect" in2="rippled" mode="screen" result="metallic-result" />
              </filter>
            </defs>
          </svg>

          {/* LAYER 1: GAMBAR NORMAL */}
          <div className="absolute inset-0 z-0">
            <img src={imageSrc} alt="Original Identity" className="h-full w-full object-cover" />
          </div>

          {/* LAYER 2: MASKED REFLECTIVE AREA */}
          <div
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 ease-out"
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
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                filter: `saturate(${hoverSaturation}) contrast(120%) brightness(110%) blur(${blurStrength}px) url(#${filterId})`,
                transform: 'scale(1.02)',
              }}
            />
            <div
              className="absolute inset-0 opacity-[var(--roughness)] mix-blend-overlay"
              style={{ '--roughness': roughness } as React.CSSProperties}
            >
              <div className="h-full w-full bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%20400%20400%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27noiseFilter%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.9%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url(%23noiseFilter)%27%2F%3E%3C%2Fsvg%3E')] opacity-50" />
            </div>
            <div
              className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.3)_100%)] mix-blend-soft-light"
              style={{ opacity: metalness }}
            />
          </div>

          {/* UI CONTENT (Front) */}
          <div className="pointer-events-none absolute inset-0 z-30 rounded-[20px] bg-gradient-to-br from-white/30 via-transparent to-white/20 p-[1px]" />
          <div className="pointer-events-none relative z-40 flex h-full flex-col justify-between p-4 text-white">
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <div className="flex items-center gap-1.5 rounded border border-white/10 bg-black/40 px-2 py-1 text-[10px] font-bold tracking-[0.1em] backdrop-blur-md">
                <Lock size={14} className="opacity-80" />
                <span>SECURE ACCESS</span>
              </div>
              <Activity className="opacity-80" size={20} />
            </div>
            <div className="mb-4 flex flex-1 flex-col items-center justify-end gap-6 text-center drop-shadow-lg"></div>
            <div className="flex items-end justify-between border-t border-white/20 pt-2 drop-shadow-md">
              <div className="text-left">
                <h2 className="m-0 mb-2 text-[14px] font-bold tracking-[0.05em]">{name}</h2>
                <p className="m-0 text-[10px] font-semibold tracking-[0.2em] uppercase opacity-80">
                  {role}
                </p>
              </div>
              <div className="pointer-events-auto cursor-pointer rounded-full p-2 transition-colors hover:bg-white/10">
                <Fingerprint size={32} className="opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            BACK FACE
        ================================================================= */}
        <div className="absolute inset-0 h-full w-full [transform:rotateY(180deg)] overflow-hidden rounded-[20px] border border-zinc-800 bg-zinc-900 shadow-xl [backface-visibility:hidden]">
          {/* Back Content Container */}
          <div className="relative flex h-full w-full flex-col p-6 text-white">
            {/* Gradient Background for Back */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-800 to-zinc-950 opacity-50" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                {backContent || <div className="text-sm text-zinc-500">No details available.</div>}
              </div>

              <div className="mt-auto border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-[10px] tracking-widest uppercase opacity-60">
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
