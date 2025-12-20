'use client'; // Wajib ditambahkan karena kita pakai useState

import React, { useState } from 'react';
import Image from 'next/image';
import { FooterColumn, FooterProps } from './type'; // Pastikan path ini sesuai
import Link from 'next/link';
import { Disc, Github, Twitter, ChevronDown } from 'lucide-react'; // Tambah ChevronDown
import { SocialButton } from './social-button'; // Pastikan path ini sesuai
import { MoonLogo } from './moon-logo'; // Pastikan path ini sesuai
export * from './moon-logo';
export * from './social-button';
export * from './type';
// --- Data Default ---
const defaultColumns: FooterColumn[] = [
  {
    title: 'Products',
    links: [
      { label: 'MoonUI Components', href: '#' },
      { label: 'MoonUI Templates', href: '#' },
      { label: 'MoonUI Gradients', href: '#' },
    ],
  },
  {
    title: 'Premium',
    links: [
      { label: 'Upgrade Pro', href: '#' },
      { label: 'Upgrade Pro Plus', href: '#' },
      { label: 'Contact Support', href: '#' },
    ],
  },
  {
    title: 'MoonUI Design',
    links: [
      { label: 'Explore Now', href: '#' },
      { label: 'Become an Affiliate', href: '#' },
      { label: 'About Us', href: '#' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Active Membership', href: '#' },
      { label: 'Sign In', href: '#' },
      { label: 'Reset Password', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Use', href: '#' },
      { label: 'Contact Us', href: '#' },
    ],
  },
];

const Footer: React.FC<FooterProps> = ({
  email = 'hey@moonui.design',
  copyright = '© 2025 MoonUI Design. All rights reserved.',
  columns = defaultColumns,
  socials,
}) => {
  // State untuk mengontrol Accordion di mobile
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (title: string) => {
    if (openSection === title) {
      setOpenSection(null); // Tutup jika diklik lagi
    } else {
      setOpenSection(title); // Buka section baru
    }
  };

  return (
    <footer className="relative w-full lg:w-7xl overflow-hidden pt-20 container mx-auto  ">
      {/* Garis Dekorasi Desktop */}
      <div className="hidden xl:block absolute top-[160px] left-0 w-[30%] h-px bg-neutral-300" />
      <div className="hidden xl:block absolute top-[160px] right-0 w-[30%] h-px bg-neutral-300" />

      <div className="px-4 md:px-0 relative z-10">
        {/* Bagian Header (Logo & Sosmed) */}
        <div className="flex flex-col items-start justify-start md:items-center md:text-center gap-4 md:gap-6 mb-12 lg:mb-20">
          <MoonLogo />

          <div className="max-w-lg">
            <h2 className="text-[#3D3D3D] text-[28px] md:text-[30px]/[36px] md:text-2xl font-semibold font-sans md:leading-10">
              Enhance Your Design <br /> & Development
            </h2>
            <p className="text-zinc-500 text-[24px]/[36px] md:text-2xl font-semibold font-sans md:leading-10">
              perfectly until to the moon
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <SocialButton
              href={socials?.twitter}
              icon={<Twitter className="w-4 h-4 text-white" />}
              activeColor="bg-orange-600"
            />
            <SocialButton
              href={socials?.discord}
              icon={<Disc className="w-4 h-4 text-zinc-400" />}
            />
            <SocialButton
              href={socials?.github}
              icon={<Github className="w-4 h-4 text-zinc-400" />}
            />
          </div>
        </div>

        {/* --- MENU LINKS AREA --- */}

        <div className="lg:flex flex-col gap-5 md:gap-0 justify-center items-center md:border-x border-b md:border-[#D3D3D3] md:pb-12 rounded-b-2xl">
          <div className="hidden lg:grid grid-cols-5 gap-12 md:mb-32">
            {columns.map((col, idx) => (
              <div key={idx} className="flex flex-col gap-5">
                <h3 className="text-[#3D3D3D] text-xl font-bold font-sans leading-9">
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-1">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        href={link.href}
                        className="text-zinc-500 hover:text-orange-600 text-sm font-medium font-sans leading-9 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* 2. VIEW MOBILE (Accordion - Sesuai Request) */}
          <div className="flex flex-col lg:hidden md:mb-20 ">
            {columns.map((col, idx) => {
              const isOpen = openSection === col.title;
              return (
                <div
                  key={idx}
                  className="border-b-4 border-neutral-300 border-dashed"
                >
                  {/* Header Accordion */}
                  <button
                    onClick={() => toggleSection(col.title)}
                    className="w-full py-5 flex justify-between items-center text-left focus:outline-none group"
                  >
                    <span className="text-[#3D3D3D] text-base font-medium font-sans leading-6">
                      {col.title}
                    </span>
                    {/* Icon Bulat dengan Chevron */}
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

                  {/* Isi Accordion (Links) */}
                  <div
                    className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                      isOpen ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <ul className="flex flex-col gap-0  pb-5">
                      {col.links.map((link, lIdx) => (
                        <li key={lIdx}>
                          <Link
                            href={link.href}
                            className="text-zinc-500 hover:text-orange-600 text-sm font-medium font-sans leading-7 block py-1"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
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

        {/* --- FOOTER BOTTOM --- */}

        <div className="w-full h-[80px] md:h-[292px] relative mt-10">
          {/* Perbaikan pada Image agar tidak error layout */}
          <Image
            src="/footer.svg"
            alt="Decoration"
            fill
            className="object-contain object-bottom"
          />
        </div>
      </div>

      {/* Background Text Decoration */}
    </footer>
  );
};

export default Footer;
