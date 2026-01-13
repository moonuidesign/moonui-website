'use client';

import React from 'react';
import {
  Card,
  Command,
  Component,
  Crown1,
  ImportCurve,
  Layer,
  MinusSquare,
  People,
  Stickynote,
} from 'iconsax-reactjs';
import ReflectiveCard from '../reflective-card';
import { cn } from '@/libs/utils';

import { FloatingCursor } from './floating-cursor';
import { SocialButton } from '../general/layout/main/footer/social-button';
import { InstagramIcon, LinkedInIcon, XIcon } from '../general/layout/main/footer/social-icons';
import Image from 'next/image';

// --- Sub Components ---

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-sans text-xl leading-tight font-medium text-zinc-500 md:text-2xl lg:text-[30px]">
    {children}
  </h3>
);

const MainHeading = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h2
    className={cn(
      `font-sans text-3xl leading-tight font-semibold text-zinc-900 sm:text-4xl md:text-6xl`,
      className,
    )}
  >
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
      'font-sans text-base leading-relaxed font-normal text-zinc-500 md:text-xl md:leading-8',
      className,
    )}
  >
    {children}
  </div>
);

const Bold = ({ children, className }: { className?: string; children: React.ReactNode }) => (
  <span className={cn(className, `font-medium`)}>{children}</span>
);
const AboutSection = () => {
  // const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  // const [isHovering, setIsHovering] = React.useState(false);

  // const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  //   // Disable interaction on tablet/mobile (match lg breakpoint)
  //   if (window.innerWidth < 1024) return;

  //   const rect = e.currentTarget.getBoundingClientRect();
  //   setMousePos({
  //     x: e.clientX - rect.left,
  //     y: e.clientY - rect.top,
  //   });
  // };

  return (
    <section className="z-[800] mt-10 flex flex-col items-center justify-start rounded-t-[39px] bg-[#E7E7E7] md:z-0 md:items-center md:justify-start md:rounded-none md:bg-none">
      <div className="flex w-full flex-col gap-10 md:gap-14 lg:gap-16">
        <div
          className="relative container mx-auto flex w-full max-w-[1440px] flex-col items-center px-4"
          // onMouseMove={handleMouseMove}
          // onMouseEnter={() => {
          //   if (window.innerWidth >= 1024) setIsHovering(true);
          // }}
          // onMouseLeave={() => setIsHovering(false)}
        >
          <div className="pointer-events-none absolute inset-0 hidden overflow-visible lg:block">
            <FloatingCursor
              label="Achmad"
              color="#ff4f00" // Purple
              className="top-[10%] left-[5%] md:top-[80px] md:left-[280px]"
              direction="right"
            />
            <FloatingCursor
              label="Fajar"
              color="#ec4899" // Pink
              className="top-[25%] right-[5%] md:top-[150px] md:right-[450px]"
              direction="left"
              // mouseX={mousePos.x}
              // mouseY={mousePos.y}
              // isHovering={isHovering}
            />
          </div>
          <div className="z-10 flex w-full max-w-xl flex-col gap-6 md:gap-8">
            <SectionLabel>Who are we?</SectionLabel>
            <div className="pb-2 md:pb-6">
              <MainHeading>
                Shaping the future <br className="hidden md:block" /> of design.
              </MainHeading>
            </div>

            <div className="hidden h-[1px] w-full bg-gradient-to-r from-zinc-300 to-transparent opacity-80 md:block" />

            <div className="flex flex-col gap-6 pt-4 md:pt-6">
              <HighlightText>
                <Bold className="text-[#FD4F12]">Baggy Studio</Bold> is a design agency and product
                design collective redefining how digital experiences are crafted. We blend
                creativity and technology to build products and identities that feel human, modern,
                and meaningful.
              </HighlightText>

              <HighlightText>
                Our identity captures a youthful, tech-savvy energy, simple, bold, and full of
                contrast. The symbol, born from the shape of B letter, carries a unique notch that
                gives it personality and depth. Paired with All Round Gothic’s geometric typeface
                and a striking orange palette, it radiates confidence and stands out with purpose.
              </HighlightText>

              <HighlightText>
                At Baggy Studio, our visual identity isn't just about aesthetics — it’s how we
                imagine what’s next and bring clarity to the future of design innovation.
              </HighlightText>

              <div className="flex flex-row flex-wrap items-center justify-start gap-2 text-sm text-zinc-500 md:gap-3 md:text-base">
                <p>© January 2024</p>
                <p>|</p>
                <p> Logo & Visual Identity</p>
                <p>|</p>
                <p>Baggy Studio</p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 pt-8">
              <div className="flex h-14 w-24 items-center justify-center rounded-sm text-[10px] tracking-widest text-zinc-400 md:h-16 md:w-28 md:text-xs">
                <Image src="/ttd-black.png" alt="Logo" width={100} height={100} />
              </div>
              <div>
                <div className="text-sm leading-5 font-medium text-zinc-500">MoonUI Design</div>
                <div className="font-mono text-xs leading-5 text-zinc-400 md:text-sm">
                  Design & development perfectly aligned.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BLOCK 2: STATS --- */}
        <div className="relative mx-auto w-full px-4 py-4 md:max-w-3xl md:border-y md:border-[#D3D3D3] lg:max-w-6xl">
          <span className="absolute -top-1 left-0 h-1.5 w-1.5 rounded-full bg-[#D3D3D3]" />
          <span className="absolute -top-1 right-0 h-1.5 w-1.5 rounded-full bg-[#D3D3D3]" />
          <span className="absolute -bottom-1 left-0 h-1.5 w-1.5 rounded-full bg-[#D3D3D3]" />
          <span className="absolute right-0 -bottom-1 h-1.5 w-1.5 rounded-full bg-[#D3D3D3]" />

          <div className="container mx-auto max-w-[1440px] px-4 md:px-4 lg:px-0">
            <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center md:gap-0">
              <div className="relative flex w-full flex-1 flex-row items-center gap-4 border-b py-2 md:flex-col md:items-center md:border-r md:border-b-0 md:py-0 md:last:border-r-0 lg:flex-col">
                <span className="absolute -top-1 left-0 flex h-1 w-full items-center justify-center md:hidden">
                  <span className="relative h-[1.5px] w-full rounded-full bg-[#D3D3D3]">
                    <span className="absolute top-1/2 left-0 block h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]" />
                    <span className="absolute top-1/2 right-0 block h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]" />
                  </span>
                </span>
                <span className="absolute -bottom-1 left-0 flex h-1 w-full items-center justify-center md:hidden">
                  <span className="relative h-[1.5px] w-full rounded-full bg-[#D3D3D3]">
                    <span className="absolute top-1/2 left-0 block h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]" />
                    <span className="absolute top-1/2 right-0 block h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]" />
                  </span>
                </span>
                <div className="rounded-lg border border-zinc-100 p-2 shadow-sm">
                  <Layer variant="Bold" className="h-6 w-6 text-zinc-700" />
                </div>
                <div className="flex flex-col items-start gap-1 md:items-center">
                  <span className="text-sm font-medium text-zinc-500 md:text-base">
                    Widgets & Examples
                  </span>
                  <span className="text-2xl font-semibold text-zinc-900 md:text-[30px]">400+</span>
                </div>
              </div>
              <div className="hidden h-16 w-[1px] bg-[#D3D3D3] md:block" />
              <div className="relative flex w-full flex-1 flex-row items-center gap-4 border-b py-2 md:flex-col md:items-center md:border-r md:border-b-0 md:py-0 md:last:border-r-0 lg:flex-col">
                <span className="absolute -top-1 left-0 flex h-1 w-full items-center justify-center md:hidden">
                  <span className="relative h-[1.5px] w-full rounded-full bg-[#D3D3D3]">
                    <span className="absolute top-1/2 left-0 block h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]" />
                    <span className="absolute top-1/2 right-0 block h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]" />
                  </span>
                </span>
                <span className="absolute -bottom-1 left-0 flex h-1 w-full items-center justify-center md:hidden">
                  <span className="relative h-[1.5px] w-full rounded-full bg-[#D3D3D3]">
                    <span className="absolute top-1/2 left-0 block h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]" />
                    <span className="absolute top-1/2 right-0 block h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]" />
                  </span>
                </span>

                <div className="rounded-lg border border-zinc-100 p-2 shadow-sm">
                  <Component variant="Bold" className="h-6 w-6 text-zinc-700" />
                </div>
                <div className="flex flex-col items-start gap-1 md:items-center">
                  <span className="text-sm font-medium text-zinc-500 md:text-base">
                    Components & Variant
                  </span>
                  <span className="text-2xl font-semibold text-zinc-900 md:text-[30px]">8000+</span>
                </div>
              </div>
              <div className="hidden h-16 w-[1px] bg-[#D3D3D3] md:block" />
              <div className="relative flex w-full flex-1 flex-row items-center gap-4 border-b py-2 md:flex-col md:items-center md:border-r md:border-b-0 md:py-0 md:last:border-r-0 lg:flex-col">
                <span className="absolute -top-1 left-0 flex h-1 w-full items-center justify-center md:hidden">
                  <span className="relative h-[1.5px] w-full rounded-full bg-[#D3D3D3]">
                    <span className="absolute top-1/2 left-0 block h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]" />
                    <span className="absolute top-1/2 right-0 block h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]" />
                  </span>
                </span>
                <span className="absolute -bottom-1 left-0 flex h-1 w-full items-center justify-center md:hidden">
                  <span className="relative h-[1.5px] w-full rounded-full bg-[#D3D3D3]">
                    <span className="absolute top-1/2 left-0 block h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]" />
                    <span className="absolute top-1/2 right-0 block h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]" />
                  </span>
                </span>
                <div className="rounded-lg border border-zinc-100 p-2 shadow-sm">
                  <Stickynote variant="Bold" className="h-6 w-6 text-zinc-700" />
                </div>
                <div className="flex flex-col items-start gap-1 md:items-center">
                  <span className="text-sm font-medium text-zinc-500 md:text-base">
                    Styles & Tokens
                  </span>
                  <span className="text-2xl font-semibold text-zinc-900 md:text-[30px]">400+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BLOCK 3: MISSION --- */}
        <div
          className="relative container mx-auto flex w-full max-w-[1440px] flex-col items-center gap-12 px-4 md:gap-24 md:px-0 md:pt-10"
          // onMouseMove={handleMouseMove}
          // onMouseEnter={() => {
          //   if (window.innerWidth >= 1024) setIsHovering(true);
          // }}
          // onMouseLeave={() => setIsHovering(false)}
        >
          <div className="pointer-events-none absolute inset-0 hidden overflow-visible lg:block">
            <FloatingCursor
              label="Dera"
              color="#8b5cf6" // Purple
              className="top-[10%] left-[5%] md:top-[80px] md:left-[280px]"
              direction="right"
            />
            <FloatingCursor
              label="Achmad"
              color="#ff4f00" // Pink
              className="top-[25%] right-[5%] md:top-[200px] md:right-[450px]"
              direction="left"
              // mouseX={mousePos.x}
              // mouseY={mousePos.y}
              // isHovering={isHovering}
            />
          </div>
          <div className="flex w-full max-w-xl flex-col gap-6">
            <SectionLabel>Mission and guidance.</SectionLabel>
            <div className="pb-4 md:pb-6">
              <MainHeading>
                MoonUI helps you <br className="hidden md:block" /> design well.
              </MainHeading>
            </div>

            <div className="h-1 w-full bg-gradient-to-r from-zinc-300 to-transparent opacity-80" />

            <div className="flex flex-col gap-6 pt-4 md:gap-8 md:pt-6">
              <HighlightText>
                MoonUI is a comprehensive <Bold>figma design system</Bold>
                for all designer levels. Our advanced component library enhances workflows, enabling
                efficient creation of exceptional designs. With a user-friendly interface and
                up-to-date practices, we guide users to create accurate, appealing designs.{' '}
                <Bold>comprehensive figma design system</Bold> for all designer levels.
              </HighlightText>
              <HighlightText>
                MoonUI <Bold>empowers designers</Bold>, elevating the design process for everyone in
                the field.
              </HighlightText>
            </div>
          </div>
        </div>

        {/* Mission Grid */}
        <div className="container mx-auto max-w-xl p-8 md:max-w-4xl md:px-4">
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-6 rounded-3xl bg-zinc-50/50 p-6 shadow-[0_0_0_1px_rgba(61,61,61,0.12),inset_0_0.75px_0.75px_hsla(0,0%,100%,0.64)] transition-shadow hover:shadow-md md:gap-7 md:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-100 p-2 shadow-sm">
                <MinusSquare className="text-zinc-700" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-2xl font-semibold text-[#3D3D3D]">Empowering</h4>
                  <span className="rounded border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-semibold tracking-wider text-zinc-500 md:text-xs">
                    MISSION
                  </span>
                </div>
                <div className="flex flex-col gap-6 text-base leading-7 font-medium text-neutral-600 md:text-lg">
                  <p>
                    At MoonUI, we are dedicated to providing UI/UX designers using Figma with the
                    best and most advanced design system.
                  </p>
                  <p>
                    Our mission is to empower designers at all levels, from juniors to senior
                    designers, with a comprehensive component library and more.
                  </p>
                  <p>
                    By offering a comprehensive design system, we enhance workflows and enable
                    designers to create exceptional designs efficiently.
                  </p>
                </div>
              </div>
              <div className="mt-auto border-t border-dashed border-zinc-200 pt-4 text-sm leading-5 text-neutral-400">
                We aim to empower designers at all levels with a comprehensive design system.
              </div>
            </div>

            <div className="flex flex-col gap-6 rounded-3xl bg-zinc-50/50 p-6 shadow-[0_0_0_1px_rgba(61,61,61,0.12),inset_0_0.75px_0.75px_hsla(0,0%,100%,0.64)] transition-shadow hover:shadow-md md:gap-7 md:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-100 p-2 shadow-sm">
                <MinusSquare className="text-zinc-700" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-2xl font-semibold text-[#3D3D3D]">Efficiency</h4>
                  <span className="rounded border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-semibold tracking-wider text-zinc-500 md:text-xs">
                    VISION
                  </span>
                </div>
                <div className="flex flex-col gap-6 text-base leading-7 font-medium text-neutral-600 md:text-lg">
                  <p>
                    With over 10 years of experience in the field, we leverage our expertise to
                    guide and inspire users towards creating accurate and visually appealing
                    designs.
                  </p>
                  <p>
                    Through thorough research, we ensure that our offerings stay up-to-date with the
                    design trends and best practices.
                  </p>
                  <p>
                    Our organized approach and user-friendly interface make it easy for designers to
                    navigate our system and elevate their design process.
                  </p>
                </div>
              </div>
              <div className="mt-auto border-t border-dashed border-zinc-200 pt-4 text-sm leading-5 text-neutral-400">
                Streamlining design workflows for maximum efficiency.
              </div>
            </div>
          </div>
        </div>

        {/* --- BLOCK 4: TEAM SECTION --- */}
        <div className="mx-auto w-full max-w-7xl rounded-4xl bg-zinc-900 px-4 py-10 shadow-xl md:px-0 lg:rounded-[40px]">
          <div className="container mx-auto flex flex-col items-start gap-12 md:max-w-xl lg:max-w-5xl">
            <div className="flex w-full flex-col gap-5">
              <div className="relative flex items-center gap-6 md:gap-10">
                <div className="flex h-8 items-center gap-1.5 rounded-lg bg-[#ff4f00] py-1.5 pr-3 pl-2 shadow-sm md:flex">
                  <People type="Outline" color="white" size={17} />
                  <span className="text-sm font-medium text-white">Our Team</span>
                  <div className="flex items-start rounded-[5px] bg-white/50 px-1.5 py-[3px]">
                    <span className="text-[11px] leading-[10px] font-semibold text-white">
                      CREW
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <MainHeading className="font-jakarta text-white">
                  Meet the heart of MoonUI
                </MainHeading>
                <p className="font-sans text-base md:text-lg">
                  <span className="font-medium text-zinc-400">Our team</span>
                  <span className="text-white"> creates </span>
                  <span className="font-medium text-zinc-400">beautiful design system.</span>
                </p>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:px-0 lg:grid-cols-3">
              <ReflectiveCard
                name="Achmad Qomarudin"
                role="Product Designer"
                email="jane@baggy.co"
                imageSrc="/Achmad - Profile.jpg"
                blurStrength={0.5}
                metalness={0.7}
                roughness={0.7}
                displacementStrength={15}
                specularConstant={0.5}
                grayscale={0.8}
                backContent={
                  <div className="flex flex-col items-center justify-center gap-4">
                    <p className="text-sm text-zinc-300">
                      Design is not just what it looks like and feels like. Design is how it works.
                    </p>
                    <div className="flex items-center gap-3">
                      <SocialButton
                        href=" https://x.com/achmaduiux"
                        icon={<XIcon className="h-4 w-4" />}
                        label="Follow Achmad on X"
                        className="bg-[#6f6e7e] text-white hover:bg-[#FF4F00]"
                      />
                      <SocialButton
                        href="https://www.instagram.com/achmad.uiux"
                        icon={<InstagramIcon className="h-4 w-4" />}
                        label="Follow Achmad on Instagram"
                        className="bg-[#6f6e7e] text-white hover:bg-[#FF4F00]"
                      />
                      <SocialButton
                        href="https://www.linkedin.com/in/achmad-qomarudin"
                        icon={<LinkedInIcon className="h-4 w-4" />}
                        label="Follow Achmad on LinkedIn"
                        className="bg-[#6f6e7e] text-white hover:bg-[#FF4F00]"
                      />
                    </div>
                  </div>
                }
              />
              <ReflectiveCard
                name="Dera Ananta"
                role="Graphic Designer"
                email="jane@baggy.co"
                imageSrc="/Dera - Profile.jpg"
                blurStrength={0.5}
                metalness={0.7}
                roughness={0.7}
                displacementStrength={15}
                specularConstant={0.5}
                grayscale={0.8}
                backContent={
                  <div className="flex flex-col items-center justify-center gap-4">
                    <p className="text-sm text-zinc-300">
                      Creative developer with a love for motion graphics and interactive design.
                    </p>
                    <div className="flex items-center gap-3">
                      <SocialButton
                        href="https://x.com/DeraAnanta7"
                        icon={<XIcon className="h-4 w-4" />}
                        label="Follow Dera on X"
                        className="bg-[#6f6e7e] text-white hover:bg-[#FF4F00]"
                      />
                      <SocialButton
                        href="https://www.instagram.com/deraananta/"
                        icon={<InstagramIcon className="h-4 w-4" />}
                        label="Follow Dera on Instagram"
                        className="bg-[#6f6e7e] text-white hover:bg-[#FF4F00]"
                      />
                      <SocialButton
                        href="https://www.linkedin.com/in/dera-ananta"
                        icon={<LinkedInIcon className="h-4 w-4" />}
                        label="Follow Dera on LinkedIn"
                        className="bg-[#6f6e7e] text-white hover:bg-[#FF4F00]"
                      />
                    </div>
                  </div>
                }
              />
              <ReflectiveCard
                name="Fajar Fernandi"
                role="FULLSTACK DEVELOPER"
                email="fajarfernandi.id@gmail.com"
                imageSrc="/Fajar - Profile.jpg"
                blurStrength={0.5}
                metalness={0.7}
                roughness={0.7}
                displacementStrength={15}
                specularConstant={0.5}
                grayscale={0.8}
                backContent={
                  <div className="flex flex-col items-center justify-center gap-4">
                    <p className="text-sm text-zinc-300">Talk is cheap. Show me the code.</p>
                    <div className="flex items-center gap-3">
                      <SocialButton
                        href="https://www.instagram.com/"
                        icon={<XIcon className="h-4 w-4" />}
                        label="Follow Fajar on X"
                        className="bg-[#6f6e7e] text-white hover:bg-[#FF4F00]"
                      />
                      <SocialButton
                        href="https://www.instagram.com/"
                        icon={<InstagramIcon className="h-4 w-4" />}
                        label="Follow Fajar on Instagram"
                        className="bg-[#6f6e7e] text-white hover:bg-[#FF4F00]"
                      />
                      <SocialButton
                        href="https://www.instagram.com/"
                        icon={<LinkedInIcon className="h-4 w-4" />}
                        label="Follow Fajar on LinkedIn"
                        className="bg-[#6f6e7e] text-white hover:bg-[#FF4F00]"
                      />
                    </div>
                  </div>
                }
              />
            </div>

            <div className="w-full px-0 text-left">
              <p className="text-sm text-white">
                We make <span className="text-zinc-400">design & code work easier</span> and{' '}
                <span className="text-white">better</span>.
              </p>
            </div>
          </div>
        </div>

        {/* --- BLOCK 5: VALUES / PROCESS --- */}
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-12 rounded-t-4xl border-x border-t border-[#D3D3D3] pt-10 md:mt-10 md:mb-[60px] md:gap-16 md:pt-10">
          <span className="absolute bottom-0 -left-[3px] size-1.5 rounded-full bg-[#D3D3D3]" />
          <span className="absolute -right-[3.5px] bottom-0 size-1.5 rounded-full bg-[#D3D3D3]" />
          <div className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-orange-600 py-1.5 pr-3 pl-2 shadow-sm">
            <Crown1 variant="Outline" color="white" size={16} />
            <span className="font-sans text-sm leading-5 font-medium text-white">Values</span>
          </div>

          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-12 lg:gap-16">
            <div className="flex flex-col items-center gap-4 p-4 text-center md:p-0">
              <div className="rounded-lg border border-zinc-100 p-2 shadow-sm">
                <Card variant="Bold" className="h-8 w-8 text-zinc-800" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-medium text-[#3D3D3D]">Understanding Needs</h4>
                <p className="text-sm leading-6 text-zinc-500">
                  We research extensively to deeply understand designers needs and deliver exact
                  solutions.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 p-4 text-center md:p-0">
              <div className="rounded-lg border border-zinc-100 p-2 shadow-sm">
                <ImportCurve variant="Bold" className="h-8 w-8 text-zinc-800" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-medium text-[#3D3D3D]">Continuous Improvement</h4>
                <p className="text-sm leading-6 text-zinc-500">
                  We shape our solutions through customer feedback to ensure continuous quality and
                  innovation.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 p-4 text-center md:p-0">
              <div className="rounded-lg border border-zinc-100 p-2 shadow-sm">
                <Command variant="Bold" className="h-8 w-8 text-zinc-800" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-medium text-[#3D3D3D]">Responsive Communication</h4>
                <p className="text-sm leading-6 text-zinc-500">
                  We provide prompt responses to customer inquiries via various channels and fast
                  support.
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
