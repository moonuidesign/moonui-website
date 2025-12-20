'use client';

import React from 'react';
import Image from 'next/image';
import { FloatingCursor } from './floating-cursor';
import {
  Card,
  Command,
  Component,
  ImportCurve,
  Layer,
  MinusSquare,
  Stickynote,
} from 'iconsax-reactjs';
import { LinkedinIcon, TwitterIcon } from 'lucide-react';
import ReflectiveCard from '../reflective-card';
import { cn } from '@/libs/utils';

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-zinc-500 text-2xl md:text-[28px] md:text-[30px] font-medium font-sans leading-tight">
    {children}
  </h3>
);

const MainHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-zinc-900 text-4xl md:text-6xl font-semibold font-sans leading-tight">
    {children}
  </h2>
);

const HighlightText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`text-zinc-500 text-lg md:text-xl font-normal font-sans leading-7 md:leading-8 ${className}`}
  >
    {children}
  </div>
);

const Bold = ({
  children,
  className,
}: {
  className?: string;
  children: React.ReactNode;
}) => <span className={cn(className, ` font-medium`)}>{children}</span>;

interface TeamMemberProps {
  name: string;
  role: string;
  imageSrc: string;
}

const TeamCard: React.FC<TeamMemberProps> = ({ name, role, imageSrc }) => (
  <div className="flex-1 min-w-[240px] p-7 bg-white rounded-[20px] shadow-[inset_0px_0px_0px_1px_rgba(224,224,224,1.00)] flex flex-col gap-7 hover:shadow-lg transition-shadow duration-300">
    <div className="relative w-14 h-14 rounded-full overflow-hidden mix-blend-luminosity">
      <Image src={imageSrc} alt={name} fill className="object-cover" />
    </div>
    <div className="flex flex-col gap-1">
      <div className="text-[#3D3D3D] text-lg font-medium leading-7">{name}</div>
      <div className="text-zinc-500 text-base font-medium leading-6">
        {role}
      </div>
    </div>
    <div className="flex gap-2">
      <button className="w-8 h-8 bg-white rounded-lg shadow-sm border border-zinc-100 flex justify-center items-center hover:bg-zinc-50 transition-colors">
        <TwitterIcon />
      </button>
      <button className="w-8 h-8 bg-white rounded-lg shadow-sm border border-zinc-100 flex justify-center items-center hover:bg-zinc-50 transition-colors">
        <LinkedinIcon />
      </button>
    </div>
  </div>
);

// --- Main Component ---

const AboutSection = () => {
  return (
    <section className=" py-16 md:py-32  relative">
      <div className=" px-6 lg:px-0 flex flex-col gap-32 md:gap-5">
        {/* --- BLOCK 1: WHO ARE WE --- */}
        <div className="relative flex max-w-[1440px]  mx-auto container  w-3xl flex-col items-center">
          <div className="hidden lg:block">
            <FloatingCursor
              label="Erşad"
              color="#8b5cf6"
              className="-left-[130px] top-[80px]"
              direction="right"
            />
            <FloatingCursor
              label="Sarah"
              color="#ec4899"
              className="right-[340px] top-[150px]"
            />
          </div>

          <div className="w-full max-w-7xl flex flex-col gap-6 md:gap-3 z-10">
            <SectionLabel>Who are we?</SectionLabel>

            <div className="pb-4 md:pb-6">
              <MainHeading>
                Shaping the future <br className="hidden md:block" /> of design.
              </MainHeading>
            </div>

            <div className="w-full h-1 bg-gradient-to-r from-zinc-300 to-transparent opacity-80" />

            <div className="pt-4 md:pt-6 flex flex-col gap-6 md:gap-8">
              <HighlightText>
                <Bold className="text-[#FD4F12]">Baggy Studio</Bold> is a design
                agency and product design collective redefining how digital
                experiences are crafted. We blend creativity and technology to
                build products and identities that feel human, modern, and
                meaningful.
              </HighlightText>

              <HighlightText>
                Our identity captures a youthful, tech-savvy energy, simple,
                bold, and full of contrast. The symbol, born from the shape of B
                letter, carries a unique notch that gives it personality and
                depth. Paired with All Round Gothic’s geometric typeface and a
                striking orange palette, it radiates confidence and stands out
                with purpose.
              </HighlightText>

              <HighlightText>
                At Baggy Studio, our visual identity isn't just about aesthetics
                — it’s how we imagine what’s next and bring clarity to the
                future of design innovation.
              </HighlightText>

              <div className="flex flex-row justify-start gap-3 items-center">
                <p>© January 2024</p>
                <p>|</p>
                <p> Logo & Visual Identity</p>
                <p>|</p>
                <p>Baggy Studio</p>
              </div>
            </div>

            <div className="pt-8 flex flex-col items-start gap-3">
              <div className="w-28 h-16 border border-zinc-400 rounded-sm flex items-center justify-center text-xs text-zinc-400">
                LOGO
              </div>
              <div>
                <div className="text-zinc-500 text-sm font-medium leading-5">
                  AlignUI Design System
                </div>
                <div className="text-zinc-400 text-sm font-mono leading-5">
                  Design & development perfectly aligned.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BLOCK 2: STATS --- */}
        <div className="w-full border-y border-zinc-200 py-8 md:py-12 relative">
          <Image
            src="https://placehold.co/9x9"
            alt=""
            width={8}
            height={8}
            className="absolute -top-1 left-0 hidden md:block"
          />
          <Image
            src="https://placehold.co/9x9"
            alt=""
            width={8}
            height={8}
            className="absolute -top-1 right-0 hidden md:block"
          />
          <Image
            src="https://placehold.co/9x9"
            alt=""
            width={8}
            height={8}
            className="absolute -bottom-1 left-0 hidden md:block"
          />
          <Image
            src="https://placehold.co/9x9"
            alt=""
            width={8}
            height={8}
            className="absolute -bottom-1 right-0 hidden md:block"
          />

          <div className="  max-w-[1440px] py-7  mx-auto container  w-7xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0 border-y border-[#D3D3D3]">
            <div className="flex-1 w-full flex md:flex-col items-start md:items-center gap-4 md:gap-4 md:border-r border-zinc-200 last:border-0 pb-6 md:pb-0 border-b md:border-b-0">
              <Layer />
              <div className="flex flex-col items-start md:items-center gap-1">
                <span className="text-zinc-500 text-base font-medium">
                  Widgets & Examples
                </span>
                <span className="text-zinc-900 text-[28px] md:text-[30px] font-semibold">
                  400+
                </span>
              </div>
            </div>
            <div className="w-full md:w-[1px] h-[1px] md:h-20 bg-[#D3D3D3] self-center" />
            <div className="flex-1 w-full flex md:flex-col items-start md:items-center gap-4 md:gap-4 md:border-r border-zinc-200 last:border-0 pb-6 md:pb-0 border-b md:border-b-0">
              <Layer />
              <div className="flex flex-col items-start md:items-center gap-1">
                <span className="text-zinc-500 text-base font-medium">
                  Widgets & Examples
                </span>
                <span className="text-zinc-900 text-[28px] md:text-[30px] font-semibold">
                  400+
                </span>
              </div>
            </div>
            <div className="w-full md:w-[1px] h-[1px] md:h-20 bg-[#D3D3D3] self-center" />
            <div className="flex-1 w-full flex md:flex-col items-start md:items-center gap-4 md:gap-4 md:border-r border-zinc-200 last:border-0 pb-6 md:pb-0 border-b md:border-b-0">
              <Component />
              <div className="flex flex-col items-start md:items-center gap-1">
                <span className="text-zinc-500 text-base font-medium">
                  Components & Variant
                </span>
                <span className="text-zinc-900 text-[28px] md:text-[30px] font-semibold">
                  8000+
                </span>
              </div>
            </div>
            <div className="w-full md:w-[1px] h-[1px] md:h-20 bg-[#D3D3D3] self-center" />
            <div className="flex-1 w-full flex md:flex-col items-start md:items-center gap-4 md:gap-4">
              <Stickynote />
              <div className="flex flex-col items-start md:items-center gap-1">
                <span className="text-zinc-500 text-base font-medium">
                  Styles, Variable & Tokens
                </span>
                <span className="text-zinc-900 text-[28px] md:text-[30px] font-semibold">
                  400+
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- BLOCK 3: MISSION --- */}
        <div className="relative  max-w-[1440px] mx-auto container  w-3xl flex flex-col items-center gap-16 md:gap-24">
          <div className="hidden lg:block">
            <FloatingCursor
              label="Alex"
              color="#f59e0b"
              className="left-[-140px] top-[100px]"
            />
            <FloatingCursor
              label="Achmad"
              color="#f59e0b"
              className="left-[-140px] top-[100px]"
              direction="right"
            />
          </div>

          <div className="w-full max-w-7xl flex flex-col gap-6 md:gap-3">
            <SectionLabel>Mission and guidance.</SectionLabel>
            <div className="pb-4 md:pb-6">
              <MainHeading>
                AlignUI helps you <br className="hidden md:block" /> design
                well.
              </MainHeading>
            </div>

            <div className="w-full h-1 bg-gradient-to-r from-zinc-300 to-transparent opacity-80" />

            <div className="pt-4 md:pt-6 flex flex-col gap-6 md:gap-8">
              <HighlightText>
                AlignUI is a <Bold>comprehensive figma design system</Bold> for
                all designer levels.
              </HighlightText>
              <HighlightText>
                AlignUI <Bold>empowers designers</Bold>, elevating the design
                process for everyone in the field.
              </HighlightText>
            </div>
          </div>
        </div>
        <div className="container mx-auto w-5xl">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 md:p-8  bg-color-grey-95 rounded-3xl shadow-[0_0_0_1px_rgba(61,61,61,0.12),inset_0_0.75px_0.75px_hsla(0,0%,100%,0.64)] flex flex-col gap-6 md:gap-7">
              <div className="w-11 h-11  bg-color-grey-95 rounded-xl shadow-[0_0_0_1px_rgba(61,61,61,0.12),inset_0_0.75px_0.75px_hsla(0,0%,100%,0.64)] flex justify-center items-center">
                <MinusSquare />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-[#3D3D3D] text-2xl font-semibold">
                    Empowering
                  </h4>
                  <span className="px-1.5 py-0.5 bg-transparent rounded border border-zinc-200 text-zinc-500 text-[10px] md:text-xs font-semibold tracking-wider">
                    MISSION
                  </span>
                </div>
                <div className="self-stretch flex  flex-col justify-start items-start gap-7">
                  <p className="justify-center text-neutral-600 text-lg font-medium font-['Inter'] leading-7">
                    At AlignUI, we are dedicated to providing
                    <br />
                    UI/UX designers using Figma with the best
                    <br />
                    and most advanced design system.
                  </p>
                  <p className="justify-center text-neutral-600 text-lg font-medium font-['Inter'] leading-7">
                    Our mission is to empower designers at all
                    <br />
                    levels, from juniors to senior designers, with
                    <br />a comprehensive component library and
                    <br />
                    more.
                  </p>
                  <p className="justify-center text-neutral-600 text-lg font-medium font-['Inter'] leading-7">
                    By offering a comprehensive design system,
                    <br />
                    we enhance workflows and enable
                    <br />
                    designers to create exceptional designs
                    <br />
                    efficiently.
                  </p>
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-center text-neutral-400 text-[14px] font-normal font-['Inter'] leading-5">
                  We aim to empower designers at all levels
                  <br />
                  with a comprehensive design system.
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8  bg-color-grey-95 rounded-3xl shadow-[0_0_0_1px_rgba(61,61,61,0.12),inset_0_0.75px_0.75px_hsla(0,0%,100%,0.64)] flex flex-col gap-6 md:gap-7">
              <div className="w-11 h-11  bg-color-grey-95 rounded-xl shadow-[0_0_0_1px_rgba(61,61,61,0.12),inset_0_0.75px_0.75px_hsla(0,0%,100%,0.64)] flex justify-center items-center">
                <MinusSquare />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-[#3D3D3D] text-2xl font-semibold">
                    Empowering
                  </h4>
                  <span className="px-1.5 py-0.5 bg-transparent rounded border border-zinc-200 text-zinc-500 text-[10px] md:text-xs font-semibold tracking-wider">
                    MISSION
                  </span>
                </div>
                <div className="self-stretch flex  flex-col justify-start items-start gap-7">
                  <p className="justify-center text-neutral-600 text-lg font-medium font-['Inter'] leading-7">
                    At AlignUI, we are dedicated to providing
                    <br />
                    UI/UX designers using Figma with the best
                    <br />
                    and most advanced design system.
                  </p>
                  <p className="justify-center text-neutral-600 text-lg font-medium font-['Inter'] leading-7">
                    Our mission is to empower designers at all
                    <br />
                    levels, from juniors to senior designers, with
                    <br />a comprehensive component library and
                    <br />
                    more.
                  </p>
                  <p className="justify-center text-neutral-600 text-lg font-medium font-['Inter'] leading-7">
                    By offering a comprehensive design system,
                    <br />
                    we enhance workflows and enable
                    <br />
                    designers to create exceptional designs
                    <br />
                    efficiently.
                  </p>
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-center text-neutral-400 text-[14px] font-normal font-['Inter'] leading-5">
                  We aim to empower designers at all levels
                  <br />
                  with a comprehensive design system.
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* --- BLOCK 4: TEAM SECTION (NEW) --- */}
        <div className="w-full py-10 mx-auto bg-white ">
          {/* Decorative lines/gradient background effect */}
          <div className="absolute top-0 left-0 w-px h-72 bg-gradient-to-b from-transparent to-red-100/50 hidden lg:block -translate-x-8"></div>

          <div className="flex flex-col items-start  gap-16 md:w-max-6xl md:w-6xl container mx-auto">
            <div className="flex flex-col gap-5 w-full">
              <div className="flex  items-center gap-10">
                <div className="hidden md:flex h-8 pl-2 pr-3 py-1.5  rounded-lg shadow-sm border border-zinc-100 items-center gap-1.5">
                  <div className="w-4 h-4 border border-zinc-400 rounded-[1px]" />
                  <span className="text-zinc-600 text-sm font-medium">
                    Our Team
                  </span>
                  <div className="h-4 px-1.5 bg-red-50 rounded flex items-center shadow-sm border border-red-200">
                    <span className="text-red-500 text-[10px] font-bold tracking-tight">
                      CREW
                    </span>
                  </div>
                </div>
                <div className="flex-1 h-px bg-zinc-100 hidden md:block" />
              </div>

              <div className="px-0  flex flex-col gap-4">
                <MainHeading>Meet the heart of AlignUI™️</MainHeading>
                <p className="text-lg">
                  <span className="text-zinc-600 font-medium">Our team</span>
                  <span className="text-zinc-400"> creates </span>
                  <span className="text-zinc-600 font-medium">
                    beautiful design system.
                  </span>
                </p>
              </div>
            </div>

            <div className="w-full grid grid-cols-4 gap-4">
              <ReflectiveCard
                name="JANE DOE"
                role="FULLSTACK DEVELOPER"
                email="jane@baggy.co"
                imageSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop"
                blurStrength={3}
                metalness={0.8}
                roughness={0.5}
                displacementStrength={15}
                specularConstant={1.0}
                grayscale={0.8}
              />
              <ReflectiveCard
                name="JANE DOE"
                role="FULLSTACK DEVELOPER"
                email="jane@baggy.co"
                imageSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop"
                blurStrength={3}
                metalness={0.8}
                roughness={0.5}
                displacementStrength={15}
                specularConstant={1.0}
                grayscale={0.8}
              />
              <ReflectiveCard
                name="JANE DOE"
                role="FULLSTACK DEVELOPER"
                email="jane@baggy.co"
                imageSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop"
                blurStrength={3}
                metalness={0.8}
                roughness={0.5}
                displacementStrength={15}
                specularConstant={1.0}
                grayscale={0.8}
              />
              <ReflectiveCard
                name="JANE DOE"
                role="FULLSTACK DEVELOPER"
                email="fajarfernandi@baggy.co"
                imageSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop"
                blurStrength={3}
                metalness={0.8}
                roughness={0.5}
                displacementStrength={15}
                specularConstant={1.0}
                grayscale={0.8}
              />
            </div>

            <div className="px-0 md:px-24">
              <p className="text-zinc-500 text-sm">
                We make{' '}
                <span className="text-[#3D3D3D]">
                  design & code work easier
                </span>{' '}
                and <span className="text-[#3D3D3D]">better</span>.
              </p>
            </div>
          </div>
        </div>

        {/* --- BLOCK 5: VALUES / PROCESS (NEW) --- */}
        <div className="w-full flex flex-col items-center gap-16">
          {/* Divider Graphic */}
          <div className="w-full max-w-3xl h-14 relative flex justify-center items-center">
            <div className="w-full border-t border-dashed border-zinc-300 absolute top-1/2"></div>
          </div>

          {/* Values Grid */}
          <div className="w-full flex flex-col md:flex-row justify-center items-start gap-16">
            {/* Value 1 */}
            <div className="flex-1 flex flex-col items-center text-center gap-4 min-w-[240px]">
              <Card />
              <div className="flex flex-col gap-1">
                <h4 className="text-[#3D3D3D] text-base font-medium">
                  Understanding Needs
                </h4>
                <p className="text-zinc-500 text-sm leading-5">
                  We research extensively to deeply
                  <br />
                  understand designers needs.
                </p>
              </div>
            </div>

            {/* Value 2 */}
            <div className="flex-1 flex flex-col items-center text-center gap-4 min-w-[240px]">
              <ImportCurve />
              <div className="flex flex-col gap-1">
                <h4 className="text-[#3D3D3D] text-base font-medium">
                  Continuous Improvement
                </h4>
                <p className="text-zinc-500 text-sm leading-5">
                  We shape our solutions through customer
                  <br />
                  feedback to ensure continuous quality
                  <br />
                  and innovation.
                </p>
              </div>
            </div>

            {/* Value 3 */}
            <div className="flex-1 flex flex-col items-center text-center gap-4 min-w-[240px]">
              <Command />
              <div className="flex flex-col gap-1">
                <h4 className="text-[#3D3D3D] text-base font-medium">
                  Responsive Communication
                </h4>
                <p className="text-zinc-500 text-sm leading-5">
                  We provide prompt responses to customer
                  <br />
                  inquiries via various channels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
export * from './floating-cursor';
export * from './team-card';
