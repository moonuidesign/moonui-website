import ContactSection from '@/components/contact';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — Get in Touch',
  description:
    'Get in touch with the MoonUI Design team. We are here to help with questions about our premium UI components, templates, and design assets.',
  openGraph: {
    title: 'Contact Us — MoonUI Design',
    description: 'Get in touch with the MoonUI Design team for support and inquiries.',
    url: 'https://moonui.design/contact',
  },
  alternates: {
    canonical: 'https://moonui.design/contact',
  },
};

export default function Page() {
  return <ContactSection />;
}
