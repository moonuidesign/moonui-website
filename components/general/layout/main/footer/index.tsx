'use client'; // Wajib ditambahkan karena kita pakai useState

import React, { useState } from 'react';
import Image from 'next/image';
import { FooterProps } from './type'; // Pastikan path ini sesuai
import Link from 'next/link';
import { ChevronDown } from 'lucide-react'; // Tambah ChevronDown
import { SocialButton } from './social-button'; // Pastikan path ini sesuai
import { MoonLogo } from './moon-logo'; // Pastikan path ini sesuai
import { ContentType, useFilterStore } from '@/contexts';
import { InstagramIcon, LinkedInIcon, XIcon } from './social-icons';
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
        label: 'MoonUI Templates',
        href: '/assets',
        contentType: 'templates',
      },
      {
        label: 'MoonUI Components',
        href: '/assets',
        contentType: 'components',
      },
      {
        label: 'MoonUI Assets',
        href: '/assets',

        contentType: 'components',
      },
      {
        label: 'MoonUI Gradients',
        href: '/assets',
        contentType: 'gradients',
      },
    ],
  },
  {
    title: 'Premium',
    links: [
      { label: 'Upgrade Pro', href: '/pricing' },
      { label: 'Upgrade Pro Plus', href: '/pricing' },

      { label: 'Contact Support', href: '/contact' },
    ],
  },
  {
    title: 'MoonUI Design',
    links: [
      { label: 'Explore Now', href: '/assets' },
      {
        label: 'Become an Affiliate',
        href: '/about',
      },
      { label: 'About Us', href: '/about' },
    ],
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
      { label: 'Terms of Use', href: '/terms-of-use' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
];

const Footer: React.FC<FooterProps> = ({
  email = 'hey@moonui.design',
  copyright = `© ${new Date().getFullYear()} MoonUI Design. All rights reserved.`,
  columns = defaultColumns,
  socials = {
    x: 'https://x.com/moonuidesign',
    instagram: 'https://instagram.com/moonuidesign',
    linkedin: 'https://linkedin.com/company/moonuidesign',
  },
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
    <footer className="relative container mx-auto w-full pt-20 lg:w-7xl">
      {/* Garis Dekorasi Desktop */}
      <div className="absolute top-[180px] left-0 hidden h-px w-[25%] bg-neutral-300 xl:block">
        {/* Tambahkan: top-1/2 -translate-y-1/2 */}
        <span className="absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#D3D3D3]" />
        <span className="absolute top-1/2 right-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#D3D3D3]" />
      </div>

      {/* Garis Kanan */}
      <div className="absolute top-[180px] right-0 hidden h-px w-[25%] bg-neutral-300 xl:block">
        <span className="absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#D3D3D3]" />
        <span className="absolute top-1/2 right-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#D3D3D3]" />
      </div>

      <div className="relative z-10 px-4 md:px-0">
        {/* Bagian Header (Logo & Sosmed) */}
        <div className="mb-12 flex flex-col items-start justify-start gap-4 md:items-center md:gap-6 md:text-center lg:mb-20">
          <MoonLogo />

          <div className="flex w-3xl max-w-lg flex-col items-start gap-0 md:max-w-2xl md:items-center md:gap-2">
            <h2 className="flex font-sans text-[28px] leading-tight font-semibold text-[#3D3D3D] md:text-[30px] md:leading-10">
              {/* Ubah lg:hidden menjadi md:hidden di sini */}
              Enhance Your Design <br className="md:hidden" /> & Development
            </h2>

            <p className="flex items-center gap-2 font-sans text-[24px]/[36px] font-semibold text-[#888888] md:text-2xl md:leading-10">
              perfectly until to the moon
              <Image src="/ic-rocket.svg" alt="moon" width={20} height={20} />
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <SocialButton
              href={socials?.x}
              icon={<XIcon className="h-4 w-4" />}
              label="Follow us on X"
            />
            <SocialButton
              href={socials?.instagram}
              icon={<InstagramIcon className="h-4 w-4" />}
              label="Follow us on Instagram"
            />
            <SocialButton
              href={socials?.linkedin}
              icon={<LinkedInIcon className="h-4 w-4" />}
              label="Follow us on LinkedIn"
            />
          </div>
        </div>

        {/* --- MENU LINKS AREA --- */}

        <div className="relative mx-auto flex-col items-center justify-center gap-5 rounded-b-4xl border-b md:max-w-7xl md:gap-0 md:border-x md:border-[#D3D3D3] md:pb-12 lg:flex">
          <span className="absolute top-0 -left-[3px] hidden h-1.5 w-1.5 rounded-full bg-[#D3D3D3] md:block" />
          <span className="absolute top-0 -right-[3.5px] hidden h-1.5 w-1.5 rounded-full bg-[#D3D3D3] md:block" />

          {/* DESKTOP VIEW */}
          <div className="container mx-auto hidden w-full max-w-6xl grid-cols-5 gap-5 px-5 md:mb-16 md:grid">
            {columns.map((col, idx) => (
              <div key={idx} className="flex flex-col gap-5">
                <h3 className="font-sans text-xl leading-9 font-bold text-[#3D3D3D]">
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
                          className="font-sans text-sm leading-9 font-medium text-[#888888] transition-colors hover:text-[#FF4F00] hover:underline"
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
          <div className="flex flex-col px-0 md:mb-20 md:hidden md:px-8 lg:px-0">
            {columns.map((col, idx) => {
              const isOpen = openSection === col.title;
              return (
                <div key={idx} className="border-b border-neutral-300">
                  <button
                    onClick={() => toggleSection(col.title)}
                    className="group flex w-full items-center justify-between py-5 text-left focus:outline-none"
                  >
                    <span className="font-sans text-base leading-6 font-medium text-[#3D3D3D]">
                      {col.title}
                    </span>
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(211,211,211)] shadow-[0_0_0_1px_rgba(61,61,61,0.12),inset_0_0.75px_0.75px_hsla(0,0%,100%,0.64)] transition-colors duration-200`}
                    >
                      <ChevronDown
                        className={`h-4 w-4 text-zinc-600 transition-transform duration-300 ${
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
                              className="block py-1 font-sans text-sm leading-7 font-medium text-[#888888] hover:text-[#FF4F00] hover:underline"
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
          <div className="mt-5 flex w-full items-center justify-center text-center font-sans text-[20px] font-semibold text-orange-600 underline transition-colors hover:text-orange-700 md:mt-0 md:w-full md:text-2xl">
            <Link href={`mailto:${email}`}>{email}</Link>
          </div>
        </div>
        <p className="mt-[20px] text-center font-sans text-[12px] font-medium text-neutral-400 md:mt-[30px] md:text-sm lg:mt-[30px]">
          {copyright}
        </p>
        <div className="relative mt-10 h-[80px] w-full md:h-[292px]">
          <Image src="/footer.svg" alt="Decoration" fill className="object-contain object-bottom" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
