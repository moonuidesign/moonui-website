import React, { useRef, useState, useMemo } from 'react';
import { Fingerprint, Activity, Lock } from 'lucide-react';

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
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 160, y: 250 });
  const [isHovering, setIsHovering] = useState(false);

  // ID unik untuk filter agar tidak bentrok jika ada banyak card
  const filterId = useMemo(
    () => `metallic-displacement-${Math.random().toString(36).substr(2, 9)}`,
    [],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
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

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-[400px] rounded-[20px] overflow-hidden shadow-2xl isolate font-sans cursor-pointer group ${className}`}
      style={style}
    >
      {/* --- DEFINISI SVG FILTER (Tidak berubah, mengatur tekstur logam) --- */}
      <svg
        className="absolute w-0 h-0 pointer-events-none opacity-0"
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            {/* Base Noise untuk tekstur */}
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

            {/* Membuat permukaan bergelombang berdasarkan noise */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displacementStrength}
              xChannelSelector="R"
              yChannelSelector="G"
              result="rippled"
            />

            {/* Pencahayaan: Sumber cahaya bergerak mengikuti mouse */}
            <feSpecularLighting
              in="noiseAlpha"
              surfaceScale={displacementStrength}
              specularConstant={specularConstant}
              specularExponent="30"
              lightingColor="#ffffff"
              result="light"
            >
              {/* Posisi lampu disinkronkan dengan posisi mouse */}
              <fePointLight x={mousePos.x} y={mousePos.y} z="150" />
            </feSpecularLighting>

            {/* Menggabungkan cahaya dengan gambar yang terdistorsi */}
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

      {/* =================================================================
          LAYER 1: GAMBAR NORMAL (Bawah)
          Selalu terlihat.
      ================================================================= */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageSrc}
          alt="Original Identity"
          className="w-full h-full object-cover"
        />
      </div>

      {/* =================================================================
          LAYER 2: MASKED REFLECTIVE AREA (Atas)
          Inilah kunci perubahannya.
      ================================================================= */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ease-out"
        style={{
          // Kirim koordinat mouse ke CSS Variable
          '--mouse-x': `${mousePos.x}px`,
          '--mouse-y': `${mousePos.y}px`,
          // Opasitas 0 jika tidak di-hover, 1 jika di-hover
          opacity: isHovering ? 1 : 0,
          // CSS MASKING: Membuat lingkaran di posisi mouse.
          // Area 'black' berarti terlihat, 'transparent' berarti tersembunyi.
          // Kita gunakan gradient agar pinggirannya halus (feathered).
          maskImage: `radial-gradient(circle ${maskRadius}px at var(--mouse-x) var(--mouse-y), black 40%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle ${maskRadius}px at var(--mouse-x) var(--mouse-y), black 40%, transparent 100%)`,
          // Penting: Jangan transisikan mask-image, nanti gerakannya lag.
          // Kita hanya mentransisikan opacity wrapper-nya saat mouse masuk/keluar.
        }}
      >
        {/* Gambar yang terkena Filter Logam */}
        <img
          src={imageSrc}
          alt="Reflective Identity"
          className="w-full h-full object-cover absolute inset-0"
          style={{
            filter: `saturate(${hoverSaturation}) contrast(120%) brightness(110%) blur(${blurStrength}px) url(#${filterId})`,
            transform: 'scale(1.02)', // Sedikit zoom agar distorsi tidak memotong pinggiran
          }}
        />

        {/* Overlay Texture Kasar (Hanya di dalam area mask) */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[var(--roughness)]"
          style={{ '--roughness': roughness } as React.CSSProperties}
        >
          <div className="w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%20400%20400%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27noiseFilter%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.9%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url(%23noiseFilter)%27%2F%3E%3C%2Fsvg%3E')] opacity-50" />
        </div>

        {/* Overlay Kilau Gradient (Hanya di dalam area mask) */}
        <div
          className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.3)_100%)] mix-blend-soft-light"
          style={{ opacity: metalness }}
        />
      </div>

      {/* --- UI CONTENT & BORDER (Tetap di paling atas) --- */}
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
          <div className="text-center">
            <h2 className="text-[14px] font-bold tracking-[0.05em] m-0 mb-2">
              {name}
            </h2>
            <p className="text-[10px] tracking-[0.2em] opacity-80 m-0 uppercase font-semibold">
              {role}
            </p>
          </div>
          <Fingerprint size={32} className="opacity-80" />
        </div>
      </div>
    </div>
  );
};

export default ReflectiveCard;
