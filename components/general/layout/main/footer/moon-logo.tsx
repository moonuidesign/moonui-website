import Image from 'next/image';

export const MoonLogo = () => (
  <div className="relative w-14 h-14 rounded-[20px] bg-linear-to-b from-transparent to-orange-600/80 shadow-lg flex items-center justify-center ">
    <span className="absolute inset-0 rounded-xl bg-linear-to-b from-orange-600/0 to-orange-600/30 z-40 pointer-events-none"></span>

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
