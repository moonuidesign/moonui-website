export const ComponentBadge = () => (
  // Menggunakan shadow dan border yang lebih halus agar cocok di background putih/abu
  <div className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-gray-200 bg-[#FD4F12] py-1 pr-2.5 pl-1.5 shadow-sm md:h-8">
    <div className="relative flex h-4 w-4 items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 21 20"
        className="size-[18px] text-white"
      >
        <path
          fill="currentColor"
          d="M3.417 14.375v-8.75h-1.25v8.75zm14.166-8.75v8.75h1.25v-8.75zm-1.041 9.792H4.458v1.25h12.084zM4.458 4.583h12.084v-1.25H4.458zm13.125 9.792c0 .575-.466 1.042-1.041 1.042v1.25a2.29 2.29 0 0 0 2.291-2.292zm1.25-8.75a2.29 2.29 0 0 0-2.291-2.292v1.25c.575 0 1.041.467 1.041 1.042zm-15.416 0c0-.575.466-1.042 1.041-1.042v-1.25a2.29 2.29 0 0 0-2.291 2.292zm-1.25 8.75a2.29 2.29 0 0 0 2.291 2.292v-1.25a1.04 1.04 0 0 1-1.041-1.042z"
        ></path>
        <path
          fill="currentColor"
          d="M9.875 16.042v.625h1.25v-.625zm1.25-12.084v-.625h-1.25v.625zm0 12.084V3.958h-1.25v12.084z"
        ></path>
      </svg>
    </div>

    <span className="font-sans text-sm leading-5 font-medium text-white">Components & Blocks</span>

    <div className="flex items-start rounded-[5px] bg-white/50 px-1.5 py-[3px]">
      <span className="text-[11px] leading-[10px] font-semibold text-white">PRO</span>
    </div>
  </div>
);
