'use client';

import Image from 'next/image';

export const GoProCard = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] border border-gray-200 bg-zinc-900 px-2 pt-6 pb-3 shadow-[0px_0px_0px_1px_rgba(51,51,51,0.10)] shadow-[0px_1px_1px_0.5px_rgba(51,51,51,0.04)] shadow-[0px_3px_3px_-1.5px_rgba(51,51,51,0.02)] shadow-[0px_6px_6px_-3px_rgba(51,51,51,0.04)] shadow-[0px_12px_12px_-6px_rgba(51,51,51,0.04)] shadow-[0px_24px_24px_-12px_rgba(51,51,51,0.04)] shadow-[0px_48px_48px_-24px_rgba(51,51,51,0.04)] shadow-[inset_0px_-1px_1px_-0.5px_rgba(51,51,51,0.06)] shadow-sm md:h-[33%] lg:h-[40%]">
      <Image src="/ic-diamond-small.svg" alt="Go Pro" width={100} height={100} />

      <div className="flex flex-col items-center justify-center gap-1 self-stretch rounded-[10px]">
        {/* JUDUL: Gradient Kiri Bawah -> Kanan Atas */}
        <div className="inline-flex items-center justify-start gap-1">
          <div className="justify-center bg-gradient-to-tr from-white to-[#6C6C6C] bg-clip-text text-center font-['Plus_Jakarta_Sans'] text-xl leading-6 font-extrabold text-transparent">
            Go Pro!
          </div>
        </div>

        {/* DESKRIPSI: Gradient Kiri Bawah -> Kanan Atas */}
        <div className="inline-flex items-center justify-start gap-1">
          <div className="flex-1 justify-center bg-gradient-to-tr from-[#6C6C6C] via-white to-[#6C6C6C] bg-clip-text text-center font-['Inter'] text-xs font-normal text-transparent">
            Instantly access 750+ premium library design resources.
          </div>
        </div>
      </div>

      {/* Button Action */}
      <button className="flex flex-col items-center justify-start gap-2 self-stretch overflow-hidden rounded-2xl bg-white py-1 shadow-[0px_0px_0px_1px_rgba(51,51,51,0.10)] shadow-[0px_1px_1px_0.5px_rgba(51,51,51,0.04)] shadow-[0px_3px_3px_-1.5px_rgba(51,51,51,0.02)] shadow-[0px_6px_6px_-3px_rgba(51,51,51,0.04)] shadow-[0px_12px_12px_-6px_rgba(51,51,51,0.04)] shadow-[0px_24px_24px_-12px_rgba(51,51,51,0.04)] shadow-[0px_48px_48px_-24px_rgba(51,51,51,0.04)] shadow-[inset_0px_-1px_1px_-0.5px_rgba(51,51,51,0.06)] transition-colors hover:bg-neutral-50">
        <div className="inline-flex h-fit w-full items-center justify-between self-stretch rounded-[10px] px-3">
          <div className="inline-flex h-fit w-full flex-col items-center justify-start pr-1">
            <div className="text-centerh-fit h-fit justify-center font-['Inter'] text-xs leading-6 font-medium text-neutral-800">
              Get it now
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};
