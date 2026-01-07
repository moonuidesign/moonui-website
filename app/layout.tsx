import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter, Plus_Jakarta_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import GlobalToast from '@/components/global-toast';
import './globals.css';
import NextAuthSessionProvider from '@/contexts/session-provider';
import { Suspense } from 'react';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const noopla = localFont({
  src: '../public/font/Noopla/NooplaRegular.ttf',
  variable: '--font-noopla',
});

export const metadata: Metadata = {
  title: {
    default: 'MoonUI Design — We Build Your Premium Design Library',
    template: '%s | MoonUI Design',
  },
  icons: {
    icon: '/logo-v2.svg',
  },
  description:
    'MoonUI is a premium design asset library that helps designers and businesses create better, high-quality designs faster without cutting corners.',
  keywords: [
    'UI/UX design templates',
    'Mockup',
    'Fonts',
    'Social media design',
    'Brand identity',
    'Figma templates',
    'Framer templates',
    'Figma components',
    'Framer components',
    'product design template Indonesia',
    'mobile app design',
    'UI designer',
    'UX researcher',
    'desain produk digital',
  ],
  authors: [{ name: 'MoonUI Design Team', url: 'https://moonui.design' }],
  creator: 'MoonUI Design',
  publisher: 'MoonUI Design',
  metadataBase: new URL('https://moonui.design'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://moonui.design',
    siteName: 'MoonUI Design',
    title: 'MoonUI Design — We Build Your Premium Design Library',
    description:
      'MoonUI is a premium design asset library that helps designers and businesses create better, high-quality designs faster without cutting corners.',
    images: [
      {
        url: '/logo-moonui.png',
        width: 1200,
        height: 630,
        alt: 'MoonUI Design — Premium UI Components & Templates',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MoonUI Design — We Build Your Premium Design Library',
    description:
      'MoonUI is a premium design asset library that helps designers and businesses create better, high-quality designs faster without cutting corners.',
    images: ['/logo-moonui.png'],
    creator: '@moonuidesign',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // TODO: Add Google Search Console verification
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.moonui.design" />
        <link rel="dns-prefetch" href="https://cdn.moonui.design" />
      </head>
      <body
        className={`${geistSans.variable} ${inter.variable} ${noopla.variable} bg-[#E8E8E8] ${plusJakarta.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthSessionProvider>
          <Suspense>
            <GlobalToast />
          </Suspense>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
