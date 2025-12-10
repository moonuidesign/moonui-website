import TextType from '@/components/TextType';
import { AvatarGroup } from './avatar-component';
import { FigmaIcon } from './figma-icon';
import { FramerIcon } from './framer-icon';

const HeroSection = () => {
  return (
    <div className="pt-11 lg:pt-20 mt-[68px] my-[44px] md:m-0 lg:gap-0 px-4 gap-4 mx-auto lg:max-w-6xl container flex flex-col justify-start items-center h-fit lg:h-[491px]  ">
      <div className="lg:px-2 lg:py-1.5  lg:bg-gray-200 rounded-full lg:shadow-[0px_0px_0px_1px_rgba(211,211,211,1.00)] flex-col w-full lg:flex-row  inline-flex lg:justify-start lg:items-center lg:gap-3">
        <AvatarGroup />
        <div className="w-[0.01px] hidden lg:flex h-4 relative">
          <div className="w-px h-4 left-0 top-0 absolute bg-neutral-200"></div>
        </div>
        <div className="pr-1.5 inline-flex flex-col justify-start items-start">
          <div className="justify-center">
            <span className="text-neutral-500 text-[12px] lg:text-sm font-normal font-['Inter'] leading-5">
              Trusted by
            </span>
            <span className="text-zinc-800 text-sm font-medium font-['Inter'] leading-5">
              2,500+
            </span>
            <span className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">
              Figma and Framer users!
            </span>
          </div>
        </div>
      </div>
      <div className="lg:pt-5 flex flex-col w-full lg:w-fit justify-start items-start lg:justify-start lg:items-center text-center lg:max-w-6xl lg:px-4">
        <div className="text-zinc-800 w-full justify-start items-start">
          <TextType
            className="font-semibold text-left font-jakarta text-[30px] lg:text-[78px] w-full"
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
          <div className=" text-left lg:text-center  text-zinc-800 text-[30px] lg:text-[72px] font-semibold font-jakarta lg:leading-[88px]">
            perfectly to the moon
          </div>
        </div>
      </div>
      <div className="lg:pt-6 flex flex-col justify-start items-start lg:px-4">
        <div className="flex flex-col justify-start items-center">
          <div className="text-left lg:text-center justify-center text-neutral-600 text-base font-normal font-['Inter'] lg:leading-7 lg:max-w-2xl">
            Flexible components, consistent UI, quick development, easy
            integration.
          </div>
        </div>
      </div>
      <div className="lg:pt-[24px] w-full flex flex-col justify-start items-start lg:justify-center lg:items-center">
        <div className="inline-flex justify-center items-center gap-1 flex-wrap">
          <span className="text-neutral-500 text-base font-normal font-['Inter'] leading-6">
            Built for
          </span>

          {/* Figma */}
          <div className="flex justify-start items-center gap-1 px-1">
            <FigmaIcon />
            <span className="text-neutral-700 text-base font-medium font-['Inter'] leading-6">
              Figma
            </span>
          </div>

          <span className="text-neutral-500 text-base font-normal font-['Inter'] leading-6">
            and
          </span>
          <div className="flex justify-start items-center gap-1 px-1">
            <FramerIcon />
            <span className="text-neutral-700 text-base font-medium font-['Inter'] leading-6">
              Framer
            </span>
          </div>
        </div>
      </div>
      <div className="lg:pt-8 flex flex-col w-full justify-start lg:justify-center lg:items-center items-start">
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
