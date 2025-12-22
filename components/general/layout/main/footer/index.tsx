'use client'; // Wajib ditambahkan karena kita pakai useState

import React, { useState } from 'react';
import Image from 'next/image';
import { FooterProps } from './type'; // Pastikan path ini sesuai
import Link from 'next/link';
import { Disc, Github, Twitter, ChevronDown, X } from 'lucide-react'; // Tambah ChevronDown
import { SocialButton } from './social-button'; // Pastikan path ini sesuai
import { MoonLogo } from './moon-logo'; // Pastikan path ini sesuai
import { ContentType, useFilterStore } from '@/contexts';
export * from './moon-logo';
export * from './social-button';
export * from './type';
interface ExtendedLink {
  label: string;
  href: string;
  contentType?: ContentType;
}

interface ExtendedFooterColumn {
  title: string;
  links: ExtendedLink[];
}

// --- Data Default ---
const defaultColumns: ExtendedFooterColumn[] = [
  {
    title: 'Products',
    links: [
      {
        label: 'MoonUI Components',
        href: '/assets',
        contentType: 'components',
      },
      {
        label: 'MoonUI Templates',
        href: '/assets',
        contentType: 'templates',
      },
      {
        label: 'MoonUI Gradients',
        href: '/assets',
        contentType: 'gradients',
      },
      {
        label: 'MoonUI Assets',
        href: '/assets',

        contentType: 'components',
      },
    ],
  },
  {
    title: 'Premium',
    links: [
      { label: 'Upgrade Pro', href: '/pricing' },

      { label: 'Contact Support', href: '/contact' },
    ],
  },
  {
    title: 'MoonUI Design',
    links: [{ label: 'About Us', href: '/about' }],
  },
  {
    title: 'Account',
    links: [
      { label: 'Activy License', href: '/verify-license' },
      { label: 'Sign In', href: '/signin' },
      { label: 'Reset Password', href: '/forgot-password' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Use', href: '#' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
];

const Footer: React.FC<FooterProps> = ({
  email = 'hey@moonui.design',
  copyright = '© 2025 MoonUI Design. All rights reserved.',
  columns = defaultColumns,
  socials,
}) => {
  const applySearchFilter = useFilterStore((state) => state.applySearchFilter);

  // State untuk mengontrol Accordion di mobile
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (title: string) => {
    if (openSection === title) {
      setOpenSection(null); // Tutup jika diklik lagi
    } else {
      setOpenSection(title); // Buka section baru
    }
  };

  const handleLinkClick = (link: ExtendedLink) => {
    if (link.contentType) {
      applySearchFilter({
        contentType: link.contentType,
        clearOthers: true, // Reset kategori/search query saat pindah tab utama
        searchQuery: '', // Opsional: kosongkan search bar juga
      });
    }
  };
  return (
    <footer className="relative w-full lg:w-7xl  pt-20 container mx-auto  ">
      {/* Garis Dekorasi Desktop */}
      <div className="hidden xl:block absolute top-[180px] left-0 w-[25%] h-px bg-neutral-300">
        {/* Tambahkan: top-1/2 -translate-y-1/2 */}
        <span className="h-1.5 w-1.5 absolute top-1/2 -translate-y-1/2 left-0 rounded-full bg-[#D3D3D3]" />
        <span className="h-1.5 w-1.5 absolute top-1/2 -translate-y-1/2 right-0 rounded-full bg-[#D3D3D3]" />
      </div>

      {/* Garis Kanan */}
      <div className="hidden xl:block absolute top-[180px] right-0 w-[25%] h-px bg-neutral-300">
        <span className="h-1.5 w-1.5 absolute top-1/2 -translate-y-1/2 left-0 rounded-full bg-[#D3D3D3]" />
        <span className="h-1.5 w-1.5 absolute top-1/2 -translate-y-1/2 right-0 rounded-full bg-[#D3D3D3]" />
      </div>

      <div className="px-4 md:px-0 relative z-10">
        {/* Bagian Header (Logo & Sosmed) */}
        <div className="flex flex-col items-start justify-start md:items-center md:text-center gap-4 md:gap-6 mb-12 lg:mb-20">
          <MoonLogo />

          <div className="lg:max-w-2xl max-w-lg">
            <h2 className="text-[#3D3D3D] font-sans font-semibold text-[28px] leading-tight md:text-[30px] md:leading-10">
              Enhance Your Design <br className="lg:hidden" /> & Development
            </h2>
            <p className="text-zinc-500 text-[24px]/[36px] md:text-2xl font-semibold font-sans md:leading-10">
              perfectly until to the moon
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <SocialButton
              href={socials?.twitter}
              icon={
                <Twitter className="w-4 h-4 hover:text-[#FF4F00] text-white" />
              }
              activeColor="bg-orange-600"
            />
            <SocialButton
              href={socials?.discord}
              icon={
                <Disc className="w-4 h-4 hover:text-[#FF4F00] text-zinc-400" />
              }
            />
            <SocialButton
              href={socials?.github}
              icon={
                <Github className="w-4 h-4 hover:text-[#FF4F00] text-zinc-400" />
              }
            />
            <SocialButton
              href={socials?.github}
              icon={
                <X className="w-4 h-4 hover:text-[#FF4F00] text-zinc-400" />
              }
            />
          </div>
        </div>

        {/* --- MENU LINKS AREA --- */}

        <div className="lg:flex relative md:max-w-7xl flex-col mx-auto gap-5 md:gap-0 justify-center items-center md:border-x border-b md:border-[#D3D3D3] md:pb-12 rounded-b-2xl">
          <span className="h-1.5 w-1.5 hidden md:block absolute top-0 -left-[3px] rounded-full bg-[#D3D3D3]" />
          <span className="h-1.5 w-1.5 hidden md:block absolute top-0 -right-[3px] rounded-full bg-[#D3D3D3]" />

          {/* DESKTOP VIEW */}
          <div className="hidden lg:grid grid-cols-5 gap-12 md:mb-16 w-full max-w-6xl">
            {columns.map((col, idx) => (
              <div key={idx} className="flex flex-col gap-5">
                <h3 className="text-[#3D3D3D] text-xl font-bold font-sans leading-9">
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-1">
                  {col.links.map((link, lIdx) => {
                    // Casting link ke ExtendedLink agar TS tidak complain jika tipe aslinya strict
                    const extendedLink = link as ExtendedLink;
                    return (
                      <li key={lIdx}>
                        <Link
                          href={extendedLink.href}
                          onClick={() => handleLinkClick(extendedLink)}
                          className="text-zinc-500 hover:text-orange-600 text-sm font-medium font-sans leading-9 transition-colors"
                        >
                          {extendedLink.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* MOBILE VIEW (Accordion) */}
          <div className="flex flex-col lg:hidden md:mb-20 ">
            {columns.map((col, idx) => {
              const isOpen = openSection === col.title;
              return (
                <div
                  key={idx}
                  className="border-b-4 border-neutral-300 border-dashed"
                >
                  <button
                    onClick={() => toggleSection(col.title)}
                    className="w-full py-5 flex justify-between items-center text-left focus:outline-none group"
                  >
                    <span className="text-[#3D3D3D] text-base font-medium font-sans leading-6">
                      {col.title}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex justify-center items-center transition-colors duration-200 bg-[rgb(211,211,211)] shadow-[0_0_0_1px_rgba(61,61,61,0.12),inset_0_0.75px_0.75px_hsla(0,0%,100%,0.64)]`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-600 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-orange-600' : ''
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                      isOpen ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <ul className="flex flex-col gap-0 pb-5">
                      {col.links.map((link, lIdx) => {
                        const extendedLink = link as ExtendedLink;
                        return (
                          <li key={lIdx}>
                            <Link
                              href={extendedLink.href}
                              // 3. Pasang Handler onClick juga di Mobile
                              onClick={() => handleLinkClick(extendedLink)}
                              className="text-zinc-500 hover:text-orange-600 text-sm font-medium font-sans leading-7 block py-1"
                            >
                              {extendedLink.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <a
            href={`mailto:${email}`}
            className="text-orange-600 text-[20px] justify-center items-center text-center mt-5 md:mt-0 md:text-2xl font-semibold font-sans underline hover:text-orange-700 transition-colors w-full flex"
          >
            {email}
          </a>
        </div>
        <p className="text-neutral-400 text-center text-[12px] md:text-sm font-medium font-sans">
          {copyright}
        </p>

        <div className="w-full h-[80px] md:h-[292px] relative mt-10">
          <Image
            src="/footer.svg"
            alt="Decoration"
            fill
            className="object-contain object-bottom"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
