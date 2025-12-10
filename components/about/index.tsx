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

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-zinc-500 text-2xl md:text-3xl font-medium font-sans leading-tight">
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

const Bold = ({ children }: { children: React.ReactNode }) => (
  <span className="text-zinc-800 font-medium">{children}</span>
);

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
      <div className="text-zinc-800 text-lg font-medium leading-7">{name}</div>
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
    <section className="w-full bg-white py-16 md:py-32 overflow-hidden relative">
      <div className="max-w-[1152px] mx-auto px-6 lg:px-0 flex flex-col gap-32 md:gap-40">
        {/* --- BLOCK 1: WHO ARE WE --- */}
        <div className="relative flex flex-col items-center">
          <div className="hidden lg:block">
            <FloatingCursor
              label="Erşad"
              color="#8b5cf6"
              className="left-[-180px] top-[80px]"
            />
            <FloatingCursor
              label="Sarah"
              color="#ec4899"
              className="right-[-120px] top-[150px]"
              direction="right"
            />
          </div>

          <div className="w-full max-w-[564px] flex flex-col gap-6 md:gap-3 z-10">
            <SectionLabel>Who are we?</SectionLabel>

            <div className="pb-4 md:pb-6">
              <MainHeading>
                Shaping the future <br className="hidden md:block" /> of design.
              </MainHeading>
            </div>

            <div className="w-full h-1 bg-gradient-to-r from-zinc-300 to-transparent opacity-80" />

            <div className="pt-4 md:pt-6 flex flex-col gap-6 md:gap-8">
              <HighlightText>
                AlignUI is a <Bold>powerful design system</Bold> for Figma that
                helps create great-looking websites and apps. We offer a wide
                range of <Bold>ready-to-use design</Bold> pieces, adjustable
                dashboards, and templates for different industries and needs.
              </HighlightText>

              <HighlightText>
                What makes AlignUI special is how <Bold>easy it is to use</Bold>
                . You can <Bold>quickly change and customize</Bold> our designs
                to fit your project.
              </HighlightText>

              <HighlightText>
                We keep up with all the <Bold>latest Figma updates</Bold>, so
                you&apos;re always using the newest features. Plus, you only
                need to <Bold>pay once to use AlignUI forever</Bold>, which
                saves you money in the long run.
              </HighlightText>
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

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
            <div className="flex-1 w-full flex md:flex-col items-start md:items-center gap-4 md:gap-4 md:border-r border-zinc-200 last:border-0 pb-6 md:pb-0 border-b md:border-b-0">
              <Layer />
              <div className="flex flex-col items-start md:items-center gap-1">
                <span className="text-zinc-500 text-base font-medium">
                  Widgets & Examples
                </span>
                <span className="text-zinc-900 text-3xl font-semibold">
                  400+
                </span>
              </div>
            </div>
            <div className="flex-1 w-full flex md:flex-col items-start md:items-center gap-4 md:gap-4 md:border-r border-zinc-200 last:border-0 pb-6 md:pb-0 border-b md:border-b-0">
              <Component />
              <div className="flex flex-col items-start md:items-center gap-1">
                <span className="text-zinc-500 text-base font-medium">
                  Components & Variant
                </span>
                <span className="text-zinc-900 text-3xl font-semibold">
                  8000+
                </span>
              </div>
            </div>
            <div className="flex-1 w-full flex md:flex-col items-start md:items-center gap-4 md:gap-4">
              <Stickynote />
              <div className="flex flex-col items-start md:items-center gap-1">
                <span className="text-zinc-500 text-base font-medium">
                  Styles, Variable & Tokens
                </span>
                <span className="text-zinc-900 text-3xl font-semibold">
                  400+
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- BLOCK 3: MISSION --- */}
        <div className="relative flex flex-col items-center gap-16 md:gap-24">
          <div className="hidden lg:block">
            <FloatingCursor
              label="Alex"
              color="#f59e0b"
              className="left-[-140px] top-[100px]"
            />
          </div>

          <div className="w-full max-w-[564px] flex flex-col gap-6 md:gap-3">
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

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 md:p-8 bg-zinc-50 rounded-3xl shadow-[0px_0px_0px_1px_rgba(61,61,61,0.12)] shadow-[inset_0px_0.75px_0.75px_0px_rgba(255,255,255,0.64)] flex flex-col gap-6 md:gap-7">
              <div className="w-11 h-11 bg-zinc-50 rounded-xl shadow-[0px_0px_0px_1px_rgba(61,61,61,0.12)] shadow-[inset_0px_0.75px_0.75px_0px_rgba(255,255,255,0.64)] flex justify-center items-center">
                <MinusSquare />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-zinc-800 text-2xl font-semibold">
                    Empowering
                  </h4>
                  <span className="px-1.5 py-0.5 bg-transparent rounded border border-zinc-200 text-zinc-500 text-[10px] md:text-xs font-semibold tracking-wider">
                    MISSION
                  </span>
                </div>
                <div className="flex flex-col gap-6">
                  <p className="text-zinc-600 text-lg font-medium leading-7">
                    At AlignUI, we are dedicated to providing UI/UX designers
                    using Figma with the best and most advanced design system.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-zinc-50 rounded-3xl shadow-[0px_0px_0px_1px_rgba(61,61,61,0.12)] shadow-[inset_0px_0.75px_0.75px_0px_rgba(255,255,255,0.64)] flex flex-col gap-6 md:gap-7">
              <div className="w-11 h-11 bg-zinc-50 rounded-xl shadow-[0px_0px_0px_1px_rgba(61,61,61,0.12)] shadow-[inset_0px_0.75px_0.75px_0px_rgba(255,255,255,0.64)] flex justify-center items-center">
                <MinusSquare />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-zinc-800 text-2xl font-semibold">
                    Accuracy
                  </h4>
                  <span className="px-1.5 py-0.5 bg-transparent rounded border border-zinc-200 text-zinc-500 text-[10px] md:text-xs font-semibold tracking-wider">
                    GUIDANCE
                  </span>
                </div>
                <div className="flex flex-col gap-6">
                  <p className="text-zinc-600 text-lg font-medium leading-7">
                    With over 10 years of experience in the field, we leverage
                    our expertise to guide and inspire users towards creating
                    accurate and visually appealing designs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BLOCK 4: TEAM SECTION (NEW) --- */}
        <div className="w-full flex flex-col items-start gap-16 relative">
          {/* Decorative lines/gradient background effect */}
          <div className="absolute top-0 left-0 w-px h-72 bg-gradient-to-b from-transparent to-red-100/50 hidden lg:block -translate-x-8"></div>

          {/* Header */}
          <div className="flex flex-col gap-5 w-full">
            <div className="flex items-center gap-10">
              <div className="hidden md:flex h-8 pl-2 pr-3 py-1.5 bg-white rounded-lg shadow-sm border border-zinc-100 items-center gap-1.5">
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

            <div className="px-0 md:px-24 flex flex-col gap-4">
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

          {/* Team Grid */}
          <div className="w-full px-0 md:px-24 flex flex-wrap gap-4">
            <TeamCard
              name="Erşad Başbağ"
              role="Founder & Designer"
              imageSrc="https://placehold.co/56x56"
            />
            <TeamCard
              name="Deniz Onat Yanık"
              role="Product Manager"
              imageSrc="https://placehold.co/56x56"
            />
            <TeamCard
              name="Emre Seçer"
              role="Staff Designer"
              imageSrc="https://placehold.co/56x56"
            />
          </div>

          <div className="px-0 md:px-24">
            <p className="text-zinc-500 text-sm">
              We make{' '}
              <span className="text-zinc-800">design & code work easier</span>{' '}
              and <span className="text-zinc-800">better</span>.
            </p>
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
                <h4 className="text-zinc-800 text-base font-medium">
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
                <h4 className="text-zinc-800 text-base font-medium">
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
                <h4 className="text-zinc-800 text-base font-medium">
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
