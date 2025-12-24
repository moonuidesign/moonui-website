'use client';

import React from 'react';
import {
  Card,
  Command,
  Component,
  ImportCurve,
  Layer,
  MinusSquare,
  Stickynote,
} from 'iconsax-reactjs';
import ReflectiveCard from '../reflective-card';
import { cn } from '@/libs/utils';

// --- Floating Cursor Component (Jika file terpisah belum ada) ---
// Jika Anda sudah punya file './floating-cursor', Anda bisa menghapus bagian ini
// dan gunakan import { FloatingCursor } from './floating-cursor';
import { MousePointer2 } from 'lucide-react';

const FloatingCursor = ({
  label,
  color,
  className,
  direction = 'left',
}: {
  label: string;
  color: string;
  className?: string;
  direction?: 'left' | 'right';
}) => {
  return (
    <div
      className={cn(
        'absolute pointer-events-none z-20 flex items-start gap-2',
        className,
      )}
    >
      {/* Icon Cursor */}
      <div className="relative drop-shadow-md" style={{ color: color }}>
        <MousePointer2
          className={cn(
            'w-5 h-5 fill-current',
            direction === 'right' && '-scale-x-100',
          )}
        />
      </div>

      {/* Label Tag */}
      <div
        className="px-3 py-1 rounded-full text-white text-xs font-bold shadow-md whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {label}
      </div>
    </div>
  );
};

// --- Sub Components ---

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-zinc-500 text-xl md:text-2xl lg:text-[30px] font-medium font-sans leading-tight">
    {children}
  </h3>
);

const MainHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-zinc-900 text-3xl sm:text-4xl md:text-6xl font-semibold font-sans leading-tight">
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
    className={cn(
      'text-zinc-500 text-base md:text-xl font-normal font-sans leading-relaxed md:leading-8',
      className,
    )}
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
}) => <span className={cn(className, `font-medium`)}>{children}</span>;
const AboutSection = () => {
  return (
    <section className=" z-[800] md:z-0 bg-[#E7E7E7] md:bg-none md:rounded-none rounded-t-[39px]  flex flex-col justify-start items-center md:justify-start md:items-center  ">
      <div className="w-full flex flex-col gap-10 md:gap-32">
        {/* --- BLOCK 1: WHO ARE WE --- */}
        <div className="relative px-4 flex max-w-[1440px] mx-auto container w-full flex-col items-center">
          <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-visible">
            <FloatingCursor
              label="Erşad"
              color="#8b5cf6" // Purple
              className="left-[5%] top-[10%] xl:-left-[100px] xl:top-[80px]"
              direction="left"
            />
            <FloatingCursor
              label="Sarah"
              color="#ec4899" // Pink
              className="right-[5%] top-[25%] xl:right-[150px] xl:top-[150px]"
              direction="left"
            />
          </div>

          <div className="w-full max-w-xl flex flex-col gap-6 md:gap-8 z-10">
            <SectionLabel>Who are we?</SectionLabel>

            <div className="pb-2 md:pb-6">
              <MainHeading>
                Shaping the future <br className="hidden md:block" /> of design.
              </MainHeading>
            </div>

            <div className="w-full hidden md:block h-[1px] bg-gradient-to-r from-zinc-300 to-transparent opacity-80" />

            <div className="pt-4 md:pt-6 flex flex-col gap-6">
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

              <div className="flex flex-wrap flex-row justify-start gap-2 md:gap-3 items-center text-sm md:text-base text-zinc-500">
                <p>© January 2024</p>
                <p>|</p>
                <p> Logo & Visual Identity</p>
                <p>|</p>
                <p>Baggy Studio</p>
              </div>
            </div>

            <div className="pt-8 flex flex-col items-start gap-3">
              <div className="w-24 h-14 md:w-28 md:h-16 border border-zinc-400 rounded-sm flex items-center justify-center text-[10px] md:text-xs text-zinc-400 tracking-widest">
                LOGO
              </div>
              <div>
                <div className="text-zinc-500 text-sm font-medium leading-5">
                  MoonUI Design System
                </div>
                <div className="text-zinc-400 text-xs md:text-sm font-mono leading-5">
                  Design & development perfectly aligned.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BLOCK 2: STATS --- */}
        <div className="w-full md:border-y px-4 md:border-[#D3D3D3] mx-auto py-4 relative max-w-6xl">
          <span className="absolute  rounded-full bg-[#D3D3D3] -top-1 left-0 h-1.5 w-1.5" />
          <span className="absolute  rounded-full bg-[#D3D3D3] -top-1 right-0 h-1.5 w-1.5" />
          <span className="absolute  rounded-full bg-[#D3D3D3] -bottom-1 left-0 h-1.5 w-1.5" />
          <span className="absolute  rounded-full bg-[#D3D3D3] -bottom-1 right-0 h-1.5 w-1.5" />

          <div className="max-w-[1440px] mx-auto container px-4 lg:px-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0">
              <div className="flex-1 relative w-full border-y border-[#D3D3D3] flex flex-row md:flex-col items-center md:items-center gap-4 border-b md:border-b-0 md:border-r py-2 md:py-0    md:last:border-r-0">
                <span className="absolute block md:hidden rounded-full bg-[#D3D3D3] -top-1 left-0 h-1.5 w-1.5" />
                <span className="absolute block md:hidden rounded-full bg-[#D3D3D3] -top-1 right-0 h-1.5 w-1.5" />
                <span className="absolute block md:hidden rounded-full bg-[#D3D3D3] -bottom-1 left-0 h-1.5 w-1.5" />
                <span className="absolute block md:hidden rounded-full bg-[#D3D3D3] -bottom-1 right-0 h-1.5 w-1.5" />
                <div className="p-2  rounded-lg shadow-sm border border-zinc-100">
                  <Layer variant="Bold" className="text-zinc-700 w-6 h-6" />
                </div>
                <div className="flex flex-col items-start md:items-center gap-1">
                  <span className="text-zinc-500 text-sm md:text-base font-medium">
                    Widgets & Examples
                  </span>
                  <span className="text-zinc-900 text-2xl md:text-[30px] font-semibold">
                    400+
                  </span>
                </div>
              </div>
              <div className="hidden md:block w-[1px] h-16 bg-[#D3D3D3]" />
              <div className="flex-1 relative w-full border-y border-[#D3D3D3] flex flex-row md:flex-col items-center md:items-center gap-4 border-b md:border-b-0 md:border-r py-2 md:py-0    md:last:border-r-0">
                <span className="absolute block md:hidden rounded-full bg-[#D3D3D3] -top-1 left-0 h-1.5 w-1.5" />
                <span className="absolute block md:hidden rounded-full bg-[#D3D3D3] -top-1 right-0 h-1.5 w-1.5" />
                <span className="absolute block md:hidden rounded-full bg-[#D3D3D3] -bottom-1 left-0 h-1.5 w-1.5" />
                <span className="absolute block md:hidden rounded-full bg-[#D3D3D3] -bottom-1 right-0 h-1.5 w-1.5" />
                <div className="p-2 bg-white rounded-lg shadow-sm border border-zinc-100">
                  <Component variant="Bold" className="text-zinc-700 w-6 h-6" />
                </div>
                <div className="flex flex-col items-start md:items-center gap-1">
                  <span className="text-zinc-500 text-sm md:text-base font-medium">
                    Components & Variant
                  </span>
                  <span className="text-zinc-900 text-2xl md:text-[30px] font-semibold">
                    8000+
                  </span>
                </div>
              </div>
              <div className="hidden md:block w-[1px] h-16 bg-[#D3D3D3]" />
              <div className="flex-1 relative w-full border-y border-[#D3D3D3] flex flex-row md:flex-col items-center md:items-center gap-4 border-b md:border-b-0 md:border-r py-2 md:py-0    md:last:border-r-0">
                <span className="absolute block md:hidden rounded-full bg-[#D3D3D3] -top-1 left-0 h-1.5 w-1.5" />
                <span className="absolute block md:hidden rounded-full bg-[#D3D3D3] -top-1 right-0 h-1.5 w-1.5" />
                <span className="absolute block md:hidden rounded-full bg-[#D3D3D3] -bottom-1 left-0 h-1.5 w-1.5" />
                <span className="absolute block md:hidden rounded-full bg-[#D3D3D3] -bottom-1 right-0 h-1.5 w-1.5" />
                <div className="p-2 bg-white rounded-lg shadow-sm border border-zinc-100">
                  <Stickynote
                    variant="Bold"
                    className="text-zinc-700 w-6 h-6"
                  />
                </div>
                <div className="flex flex-col items-start md:items-center gap-1">
                  <span className="text-zinc-500 text-sm md:text-base font-medium">
                    Styles & Tokens
                  </span>
                  <span className="text-zinc-900 text-2xl md:text-[30px] font-semibold">
                    400+
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BLOCK 3: MISSION --- */}
        <div className="relative max-w-[1440px] px-4 md:px-0 mx-auto container w-full flex flex-col items-center gap-12 md:gap-24">
          {/* === CURSORS ADDED HERE === */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-visible">
            <FloatingCursor
              label="Alex"
              color="#f59e0b" // Amber
              className="left-[2%] top-[10%] xl:-left-[100px] xl:top-[100px]"
              direction="right"
            />
            <FloatingCursor
              label="Achmad"
              color="#10b981" // Emerald
              className="right-[10%] top-[0%] xl:right-[100px] xl:top-[50px]"
              direction="left"
            />
          </div>

          <div className="w-full max-w-xl flex flex-col gap-6">
            <SectionLabel>Mission and guidance.</SectionLabel>
            <div className="pb-4 md:pb-6">
              <MainHeading>
                MoonUI helps you <br className="hidden md:block" /> design
                well.
              </MainHeading>
            </div>

            <div className="w-full h-1 bg-gradient-to-r from-zinc-300 to-transparent opacity-80" />

            <div className="pt-4 md:pt-6 flex flex-col gap-6 md:gap-8">
              <HighlightText>
                MoonUI is a comprehensive <Bold>figma design system</Bold>
                for all designer levels. Our advanced component library enhances
                workflows, enabling efficient creation of exceptional designs.
                With a user-friendly interface and up-to-date practices, we
                guide users to create accurate, appealing designs.{' '}
                <Bold>comprehensive figma design system</Bold> for all designer
                levels.
              </HighlightText>
              <HighlightText>
                MoonUI <Bold>empowers designers</Bold>, elevating the design
                process for everyone in the field.
              </HighlightText>
            </div>
          </div>
        </div>

        {/* Mission Grid */}
        <div className="container mx-auto max-w-xl p-8 md:px-0 md:max-w-4xl">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 md:p-8 bg-zinc-50/50 rounded-3xl shadow-[0_0_0_1px_rgba(61,61,61,0.12),inset_0_0.75px_0.75px_hsla(0,0%,100%,0.64)] flex flex-col gap-6 md:gap-7 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-white rounded-xl shadow-sm border border-zinc-100 flex justify-center items-center">
                <MinusSquare className="text-zinc-700" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-[#3D3D3D] text-2xl font-semibold">
                    Empowering
                  </h4>
                  <span className="px-2 py-0.5 bg-white rounded border border-zinc-200 text-zinc-500 text-[10px] md:text-xs font-semibold tracking-wider">
                    MISSION
                  </span>
                </div>
                <div className="flex flex-col gap-6 text-neutral-600 text-base md:text-lg font-medium leading-7">
                  <p>
                    At MoonUI, we are dedicated to providing UI/UX designers
                    using Figma with the best and most advanced design system.
                  </p>
                  <p>
                    Our mission is to empower designers at all levels, from
                    juniors to senior designers, with a comprehensive component
                    library and more.
                  </p>
                  <p>
                    By offering a comprehensive design system, we enhance
                    workflows and enable designers to create exceptional designs
                    efficiently.
                  </p>
                </div>
              </div>
              <div className="text-neutral-400 text-sm leading-5 mt-auto pt-4 border-t border-dashed border-zinc-200">
                We aim to empower designers at all levels with a comprehensive
                design system.
              </div>
            </div>

            <div className="p-6 md:p-8 bg-zinc-50/50 rounded-3xl shadow-[0_0_0_1px_rgba(61,61,61,0.12),inset_0_0.75px_0.75px_hsla(0,0%,100%,0.64)] flex flex-col gap-6 md:gap-7 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-white rounded-xl shadow-sm border border-zinc-100 flex justify-center items-center">
                <MinusSquare className="text-zinc-700" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-[#3D3D3D] text-2xl font-semibold">
                    Efficiency
                  </h4>
                  <span className="px-2 py-0.5 bg-white rounded border border-zinc-200 text-zinc-500 text-[10px] md:text-xs font-semibold tracking-wider">
                    VISION
                  </span>
                </div>
                <div className="flex flex-col gap-6 text-neutral-600 text-base md:text-lg font-medium leading-7">
                  <p>
                    With over 10 years of experience in the field, we leverage
                    our expertise to guide and inspire users towards creating
                    accurate and visually appealing designs.
                  </p>
                  <p>
                    Through thorough research, we ensure that our offerings stay
                    up-to-date with the design trends and best practices.
                  </p>
                  <p>
                    Our organized approach and user-friendly interface make it
                    easy for designers to navigate our system and elevate their
                    design process.
                  </p>
                </div>
              </div>
              <div className="text-neutral-400 text-sm leading-5 mt-auto pt-4 border-t border-dashed border-zinc-200">
                Streamlining design workflows for maximum efficiency.
              </div>
            </div>
          </div>
        </div>

        {/* --- BLOCK 4: TEAM SECTION --- */}
        <div className="w-full py-10 px-4 md:px-0 mx-auto relative bg-white">
          <div className="flex flex-col items-start gap-12 max-w-5xl container mx-auto">
            <div className="flex flex-col gap-5 w-full">
              <div className="flex relative items-center gap-6 md:gap-10">
                <div className="flex md:flex h-8 pl-2 pr-3 py-1.5 rounded-lg shadow-sm border border-zinc-100 items-center gap-1.5">
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
                <div className="flex-1 h-px bg-[#D3D3D3] block md:block relative">
                  <span className="absolute rounded-full bg-[#D3D3D3] top-1/2 transform -translate-y-1/2 left-0 h-1.5 w-1.5" />
                  <span className="absolute rounded-full bg-[#D3D3D3] top-1/2  transform -translate-y-1/2 right-0 h-1.5 w-1.5" />
                </div>
                <div className="absolute -left-[12%] w-[10%] h-px bg-[#D3D3D3] hidden md:block">
                  <span className="absolute rounded-full bg-[#D3D3D3] top-1/2 transform -translate-y-1/2 left-0 h-1.5 w-1.5" />
                  <span className="absolute rounded-full bg-[#D3D3D3] top-1/2  transform -translate-y-1/2 right-0 h-1.5 w-1.5" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <MainHeading>Meet the heart of MoonUI™️</MainHeading>
                <p className="text-base md:text-lg">
                  <span className="text-zinc-600 font-medium">Our team</span>
                  <span className="text-zinc-400"> creates </span>
                  <span className="text-zinc-600 font-medium">
                    beautiful design system.
                  </span>
                </p>
              </div>
            </div>

            <div className="w-full grid grid-cols-1 px-4 md:px-0 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                name="FAJAR FERNANDI"
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

            <div className="px-0 md:px-24 text-center md:text-left w-full">
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

        {/* --- BLOCK 5: VALUES / PROCESS --- */}
        <div className="w-full flex flex-col items-center gap-12 md:gap-16">
          <div className="w-full max-w-3xl h-8 md:h-14 relative flex justify-center items-center">
            <div className="w-full border-t border-dashed border-zinc-300 absolute top-1/2"></div>
            <div className="bg-white px-3 relative z-10 text-zinc-300 text-xs tracking-widest uppercase">
              Values
            </div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center gap-4 p-4 md:p-0">
              <div className="p-3 bg-zinc-50 rounded-2xl">
                <Card variant="Bold" className="text-zinc-800 w-8 h-8" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-[#3D3D3D] text-lg font-medium">
                  Understanding Needs
                </h4>
                <p className="text-zinc-500 text-sm leading-6">
                  We research extensively to deeply understand designers needs
                  and deliver exact solutions.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-4 md:p-0">
              <div className="p-3 bg-zinc-50 rounded-2xl">
                <ImportCurve variant="Bold" className="text-zinc-800 w-8 h-8" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-[#3D3D3D] text-lg font-medium">
                  Continuous Improvement
                </h4>
                <p className="text-zinc-500 text-sm leading-6">
                  We shape our solutions through customer feedback to ensure
                  continuous quality and innovation.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-4 md:p-0">
              <div className="p-3 bg-zinc-50 rounded-2xl">
                <Command variant="Bold" className="text-zinc-800 w-8 h-8" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-[#3D3D3D] text-lg font-medium">
                  Responsive Communication
                </h4>
                <p className="text-zinc-500 text-sm leading-6">
                  We provide prompt responses to customer inquiries via various
                  channels and fast support.
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
