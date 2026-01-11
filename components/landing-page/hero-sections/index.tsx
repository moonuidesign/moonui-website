import TextType from '@/components/TextType';
import { AvatarGroup } from './avatar-component';
import Image from 'next/image';

import { ArrowRight2 } from 'iconsax-reactjs';
import Meteors from '@/components/ui/meteors';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <div className="relative container mx-auto mb-10 flex h-fit w-7xl flex-col items-center justify-start gap-3 px-[24px] md:mt-[48px] md:max-w-3xl md:items-center md:justify-start md:px-0 md:pt-0 lg:h-[969px] lg:max-w-7xl">
      <div className="absolute -top-[250px] left-1/2 z-0 hidden h-[3800px] w-full -translate-x-1/2 overflow-visible md:block">
        <Meteors
          className="z-0"
          minDuration={2.8}
          maxDuration={4.8}
          maxDelay={5.8}
          minDelay={2.5}
          number={3}
        />
      </div>
      <Image
        src="/moonNotFound.png"
        className="pointer-events-none absolute left-[49%] z-100 hidden -translate-x-1/2 scale-[1.25] -rotate-65 select-none md:top-[40%] md:block md:h-[655px] md:w-[681px] lg:top-[21%] lg:h-[1062px] lg:w-[1103px]"
        alt="Moon decorative background"
        draggable={false}
        style={{
          opacity: 0.1,
          zIndex: 0,
        }}
        priority
        fetchPriority="high"
        sizes="(max-width: 768px) 0px, (max-width: 1024px) 681px, 1103px"
        width={1103}
        height={1062}
      />

      <div className="relative z-10 inline-flex w-full flex-col rounded-full bg-[#E7E7E7] md:w-lg md:max-w-2xl md:flex-row md:items-center md:justify-start md:gap-3 md:px-2 md:py-1.5 md:shadow-[0px_0px_0px_1px_rgba(211,211,211,1.00)] lg:w-[26rem] lg:max-w-xl">
        <AvatarGroup />
        <div className="relative hidden h-4 w-[0.01px] md:flex">
          <div className="absolute top-0 left-0 h-4 w-px bg-[#D3D3D3]"></div>
        </div>
        <div className="font-['Inter'] text-sm leading-5 font-normal text-neutral-500">
          Trusted by <span className="font-medium text-[#3D3D3D]">2,000+ users </span>
          for premium design!
        </div>
      </div>
      <div className="relative z-10 flex w-full flex-col items-start justify-start text-center md:w-full md:items-center md:justify-center md:pt-5 lg:w-full lg:max-w-6xl lg:items-center lg:justify-center lg:px-4">
        <div className="w-full items-start justify-start text-[#3D3D3D] md:items-center md:justify-center">
          <TextType
            className="font-jakarta w-full text-left text-[28px] font-semibold md:text-center md:text-[56px] lg:text-[78px]"
            text={['Designer & Businesses', 'Project & Management', 'Design & Development']}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
          />
          <div className="font-jakarta text-left text-[28px] font-semibold text-[#3D3D3D] md:text-center md:text-[56px] lg:text-center lg:text-[72px] lg:leading-[88px]">
            perfectly to the moon
          </div>
        </div>
      </div>
      <div className="relative z-10 flex w-full flex-col items-start justify-start md:items-center md:justify-center lg:px-4 lg:pt-6">
        <div className="flex max-w-[315px] justify-start text-left font-['Inter'] text-base font-normal break-all text-neutral-600 md:max-w-none md:items-center md:justify-center lg:max-w-2xl lg:text-center lg:leading-7">
          ⁠Flexible assets, consistent UI, quick MVP launch, easy integration
        </div>
      </div>
      <div className="relative z-10 flex w-full flex-col items-start justify-start lg:items-center lg:justify-center lg:pt-[24px]">
        <div className="inline-flex w-full flex-wrap items-center justify-start gap-1 md:items-center md:justify-center">
          <span className="font-['Inter'] text-base leading-6 font-normal text-neutral-500">
            Built for
          </span>

          <div className="flex items-center justify-start gap-1 px-1">
            <Image
              alt="Logo Figma"
              width={20}
              height={20}
              src="/ic-figma.svg"
              className="h-[20px] w-[20px]"
              loading="lazy"
            />
            <span className="font-['Inter'] text-base leading-6 font-medium text-neutral-700">
              Figma
            </span>
          </div>

          <span className="font-['Inter'] text-base leading-6 font-normal text-neutral-500">
            and
          </span>
          <div className="flex items-center justify-start gap-1 px-1">
            <Image
              alt="Logo Framer"
              width={20}
              height={20}
              src="/ic-framer.svg"
              className="h-[20px] w-[20px]"
              loading="lazy"
            />
            <span className="font-['Inter'] text-base leading-6 font-medium text-neutral-700">
              Framer
            </span>
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-5 flex w-full flex-col items-start justify-start md:items-center md:justify-center lg:pt-8">
        <Link
          href="/pricing"
          className="group relative z-[110] flex h-11 cursor-pointer items-center gap-3 rounded-[13px] bg-[#2E2E2E] px-5 text-white shadow-[0_8px_16px_rgba(0,0,0,0.1),0_0_0_1px_#000] transition-colors hover:bg-black"
        >
          <div className="flex items-center justify-start gap-1">
            <span className="font-['Inter'] text-sm leading-5 font-medium text-white">
              Get Started
            </span>
            <span className="font-['Inter'] text-sm leading-5 font-normal text-neutral-600">-</span>
            <span className="font-['Inter'] text-sm leading-5 font-normal text-neutral-400">
              It’s free
            </span>
          </div>
          <div className="relative flex h-full w-5 items-center justify-center">
            <div className="absolute top-0 top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center overflow-hidden text-white">
              <div className="relative flex flex-1 items-center justify-center transition-transform group-hover:translate-x-1">
                <ArrowRight2 size={18} />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;
