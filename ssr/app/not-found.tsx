'use client';
import FuzzyText from '@/components/FuzzyText';
import { Input } from '@/components/ui/input';
import { Meteors } from '@/components/ui/meteors';
import { ChevronRight, Dribbble, Instagram, Mail, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex h-screen p-4 w-screen flex-col items-center justify-between overflow-hidden bg-[#E8E8E8] font-sans dark:bg-black">
      <span className="py-4 mb-10 bg-black h-fit flex  w-full flex-row justify-center items-center gap-2 px-4 rounded-lg">
        <div className="flex gap-2 text-[#B8B8B8]">
          <p>Built faster websites with </p>
          <p className="text-white font-medium">MoonUI PRO</p>
          <p>components!</p>
        </div>
        <span className="w-[2px] h-[2px] bg-[#B8B8B8]"></span>
        <p className="text-white underline font-medium">Learn more</p>
      </span>
      {/* <Meteors /> */}
      <Image
        src="/moonNotFound.png"
        className="absolute top-[25%]  left-1/2 w-[120%] h-[180%] -translate-x-1/2 -rotate-65" // PERUBAIKAN: Koreksi translate-x untuk pemusatan yang benar
        alt="Not Found"
        style={{
          opacity: 0.25,
          zIndex: 0,
        }}
        width={1400}
        height={1200}
      />

      <div className="z-10 flex w-full  flex-col items-center justify-center gap-6 px-5 text-center">
        <FuzzyText
          fontSize="300px"
          fontWeight="700"
          color="#2E2E2E"
          baseIntensity={0}
          hoverIntensity={0.5}
          enableHover={true}
        >
          404
        </FuzzyText>
        <div className="flex mt-10 flex-row items-center gap-1">
          <h2 className="text-[30px] font-sans font-semibold">
            We’re almost ready to launch
          </h2>
          <Image
            src="/ic-rocket.svg"
            alt="rocket MoonUi"
            width={40}
            height={40}
          />
        </div>
        <div className="text-[18px] gap-1 w-full flex flex-row text-[#707070] justify-center items-center font-jakarta font-light">
          <p>Get</p>
          <div className="flex  flex-row">
            <p className="font-medium text-[#2E2E2E]">latest updates</p>
            <p>,</p>
          </div>
          <div className="flex flex-row">
            <p className="font-medium text-[#2E2E2E]">tips</p>
            <p>,</p>
          </div>
          <p>and</p>
          <p className="font-medium text-[#2E2E2E]">exclusive</p>
          <p>offers from MoonUI Design.</p>
        </div>
        <div className="flex flex-col mt-8 items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-white p-2 shadow-md">
            <span>
              <Mail className="text-[#E8E8E8]" size={30} />
            </span>
            <Input
              className="w-[290px] border-none outline-none shadow-none focus-visible:border-none focus-visible:ring-0"
              placeholder="Enter your email"
            />
            <button className="rounded-md border-2 border-[#E8E8E8] px-2 text-[#E8E8E8]">
              <ChevronRight />
            </button>
          </div>
          <span className="text-[14px] text-[#8A7F8D]">
            We respect your inbox. Privacy policy
          </span>
        </div>
      </div>
      <div className=" flex gap-4 ">
        <Link
          href="x.com/moonuidesign"
          target="_blank"
          className="flex items-center z-2 gap-2 rounded-[9px] bg-[#8A7F8D] w-[32px] h-[32px] justify-center text-white"
        >
          <Image src="/x.svg" width={18} height={18} alt="Social Media X" />
        </Link>
        <Link
          href="instagram.com/moonuidesign"
          target="_blank"
          className="flex items-center z-2 gap-2 rounded-[9px] bg-white w-[32px] h-[32px] justify-center text-[#8A7F8D]"
        >
          <Image
            src="/instagram.svg"
            width={18}
            height={18}
            alt="Social Media X"
          />
        </Link>
        <Link
          href="dribbble.com/moonuidesign"
          target="_blank"
          className="flex items-center z-2 gap-2 rounded-[9px] bg-white w-[32px] h-[32px] justify-center text-[#8A7F8D]"
        >
          <Image
            src="/dribbble.svg"
            width={18}
            height={18}
            alt="Social Media X"
          />
        </Link>
      </div>
    </div>
  );
}
