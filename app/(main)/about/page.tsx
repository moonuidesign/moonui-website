import AboutSection from '@/components/about';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — Meet the Team',
  description:
    'Learn about MoonUI Design — the team behind premium Figma and Framer templates designed to match the quality and precision of top design agencies.',
  openGraph: {
    title: 'About Us — MoonUI Design',
    description: 'The team behind premium Figma and Framer templates for modern design needs.',
    url: 'https://moonui.design/about',
  },
  alternates: {
    canonical: 'https://moonui.design/about',
  },
};

export default function AboutPage() {
  return <AboutSection />;
}
