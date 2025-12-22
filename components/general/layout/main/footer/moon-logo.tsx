import Image from 'next/image';

export const MoonLogo = () => (
  <div className="relative w-14 h-14 rounded-[20px] bg-[#1B1B1B] shadow-lg flex items-center justify-center overflow-hidden">
    <span className="absolute inset-0 rounded-xl bg-linear-to-b from-[#1B1B1B]/0 to-[#1B1B1B]/70 z-40 pointer-events-none"></span>
    <div className="w-10 h-10 relative">
      <Image
        height={100}
        src="/logo.svg"
        alt="MoonUI Logo"
        className="w-full h-full object-cover"
        width={100}
      />
    </div>
  </div>
);
