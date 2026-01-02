'use client';
import FuzzyText from '@/components/FuzzyText';
import RootLayout from '@/components/general/layout/root';
import { Input } from '@/components/ui/input';
import { ChevronRight, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <RootLayout>
      <div className="relative container mx-auto flex h-full w-screen max-w-[1440px] flex-col items-center justify-between overflow-hidden bg-[#E8E8E8] p-4 font-sans dark:bg-black">
        <Image
          src="/moonNotFound.png"
          className="w-max-[1318.4px] h-max-[1142px] pointer-events-none absolute left-[49%] hidden -translate-x-1/2 scale-[1.6] -rotate-65 select-none md:-bottom-[200px] md:block md:h-[648px] md:w-[681px] lg:top-[270px] lg:h-[848px] lg:w-[879px]"
          alt="Not Found"
          style={{
            opacity: 0.25,
            zIndex: 0,
          }}
          width={1400}
          height={1200}
        />
        <div className="z-10 flex w-full flex-col items-center justify-center gap-6 px-5 text-center">
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
          <div className="mt-10 flex flex-row items-center gap-1">
            <h2 className="font-sans text-[30px] font-semibold">We’re almost ready to launch</h2>
            <Image src="/ic-rocket.svg" alt="rocket MoonUi" width={40} height={40} />
          </div>
          <div className="font-jakarta flex w-full flex-row items-center justify-center gap-1 text-[18px] font-light text-[#707070]">
            <p>Get</p>
            <div className="flex flex-row">
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
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-white p-2 shadow-md">
              <span>
                <Mail className="text-[#E8E8E8]" size={30} />
              </span>
              <Input
                className="w-[290px] border-none shadow-none outline-none focus-visible:border-none focus-visible:ring-0"
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
        <div className="flex gap-4">
          <Link
            href="x.com/moonuidesign"
            target="_blank"
            className="z-2 flex h-[32px] w-[32px] items-center justify-center gap-2 rounded-[9px] bg-[#8A7F8D] text-white"
          >
            <Image src="/x.svg" width={18} height={18} alt="Social Media X" />
          </Link>
          <Link
            href="instagram.com/moonuidesign"
            target="_blank"
            className="z-2 flex h-[32px] w-[32px] items-center justify-center gap-2 rounded-[9px] bg-white text-[#8A7F8D]"
          >
            <Image src="/instagram.svg" width={18} height={18} alt="Social Media X" />
          </Link>
          <Link
            href="dribbble.com/moonuidesign"
            target="_blank"
            className="z-2 flex h-[32px] w-[32px] items-center justify-center gap-2 rounded-[9px] bg-white text-[#8A7F8D]"
          >
            <Image src="/dribbble.svg" width={18} height={18} alt="Social Media X" />
          </Link>
        </div>
      </div>
    </RootLayout>
  );
}
