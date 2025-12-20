import TextType from '@/components/TextType';
import { AvatarGroup } from './avatar-component';
import Image from 'next/image';
import Meteors from '@/components/ui/meteors';

const HeroSection = () => {
  return (
    <div className="pt-30 md:pt-0 relative mx-auto md:max-w-7xl -pt-[200px] mb-10 gap-3  px-[24px] md:px-0  container flex flex-col justify-start items-center md:justify-start md:items-center h-fit lg:h-[969px]  overflow-hidden  ">
      <div className="absolute h-full w-full ">
        <Meteors />
      </div>
      <Image
        src="/moonNotFound.png"
        className="absolute lg:top-[21%] select-none hidden md:block scale-[1.25] pointer-events-none w-max-[1318.4px] h-max-[1142px] left-[49%] md:w-[681px] md:h-[648px] lg:w-[1103px] lg:h-[1069px] -translate-x-1/2 -rotate-65"
        alt="Not Found"
        draggable={false}
        style={{
          opacity: 0.1,
          zIndex: 0,
        }}
        width={1400}
        height={1200}
      />

      <div className="md:px-2 relative z-10  w-full md:max-w-2xl lg:max-w-4xl md:py-1.5 rounded-full md:shadow-[0px_0px_0px_1px_rgba(211,211,211,1.00)] flex-col md:w-lg lg::w-2xl md:flex-row  inline-flex md:justify-start md:items-center md:gap-3">
        <AvatarGroup />
        <div className="w-[0.01px] hidden md:flex h-4 relative">
          <div className="w-px h-4 left-0 top-0 absolute bg-[#D3D3D3]"></div>
        </div>
        <div className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">
          Trusted by <span className="text-[#3D3D3D] font-medium">2,000+</span>{' '}
          Figma users for seamless design!
        </div>
      </div>
      <div className="md:pt-5  relative z-10 flex flex-col w-full lg:w-full md:w-full  justify-start items-start md:justify-center md:items-center lg:justify-center lg:items-center text-center lg:max-w-6xl lg:px-4">
        <div className="text-[#3D3D3D] w-full justify-start items-start md:justify-center md:items-center">
          <TextType
            className="font-semibold md:text-center text-left font-jakarta text-[28px] md:text-[56px] lg:text-[78px] w-full"
            text={[
              'Designer & Businesses',
              'Project & Management',
              'Design & Development',
            ]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
          />
          <div className=" md:text-center text-left lg:text-center  text-[#3D3D3D] text-[28px] md:text-[56px] lg:text-[72px] font-semibold font-jakarta lg:leading-[88px]">
            perfectly to the moon
          </div>
        </div>
      </div>
      <div className="lg:pt-6 relative z-10 flex flex-col justify-start items-start lg:px-4">
        <div className="flex flex-col justify-start items-center">
          <div className="text-left lg:text-center justify-center text-neutral-600 text-base font-normal font-['Inter'] lg:leading-7 lg:max-w-2xl">
            Flexible components, consistent UI, quick development, easy
            integration.
          </div>
        </div>
      </div>
      <div className="lg:pt-[24px] relative z-10 w-full flex flex-col justify-start items-start lg:justify-center lg:items-center">
        <div className="inline-flex  w-full justify-start items-center md:justify-center md:items-center gap-1 flex-wrap">
          <span className="text-neutral-500 text-base font-normal font-['Inter'] leading-6">
            Built for
          </span>

          {/* Figma */}
          <div className="flex justify-start items-center gap-1 px-1">
            <Image
              alt="Logo Figma"
              width={100}
              height={100}
              src="/ic-figma.svg"
              className="w-[20px] h-[20px]"
            />
            <span className="text-neutral-700 text-base font-medium font-['Inter'] leading-6">
              Figma
            </span>
          </div>

          <span className="text-neutral-500 text-base font-normal font-['Inter'] leading-6">
            and
          </span>
          <div className="flex justify-start items-center gap-1 px-1">
            <Image
              alt="Logo Framer"
              width={100}
              height={100}
              src="/ic-framer.svg"
              className="w-[20px] h-[20px]"
            />
            <span className="text-neutral-700 text-base font-medium font-['Inter'] leading-6">
              Framer
            </span>
          </div>
        </div>
      </div>
      <div className="lg:pt-8 flex relative z-10 mt-5 flex-col w-full justify-start md:justify-center md:items-center items-start">
        <button className="h-11 px-4 bg-zinc-800 rounded-xl shadow-button hover:bg-zinc-700 transition-colors flex justify-center items-center gap-3.5 overflow-hidden cursor-pointer group">
          <div className="flex justify-start items-center gap-1">
            <span className="text-white text-sm font-medium font-['Inter'] leading-5">
              Get Started
            </span>
            <span className="text-neutral-600 text-sm font-normal font-['Inter'] leading-5">
              -
            </span>
            <span className="text-neutral-400 text-sm font-normal font-['Inter'] leading-5">
              It’s free
            </span>
          </div>
          <div className="w-2 h-5 relative">
            <div className="w-5 h-5 left-[-6px] top-0 absolute inline-flex flex-col justify-center items-center overflow-hidden">
              <div className="w-5 flex-1 relative group-hover:translate-x-1 transition-transform">
                <div className="w-[3.33px] h-1.5 left-[8.33px] top-[6.67px] absolute outline outline-[1.25px] outline-offset-[-0.63px] outline-neutral-400"></div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
