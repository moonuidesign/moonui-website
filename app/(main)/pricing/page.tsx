import NewsletterSection from '@/components/landing-page/newslatter';
import PricingSection from '@/components/pricing';
import { getActiveDiscount } from '@/server-action/action-discount';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Choose Your Perfect Plan',
  description:
    'Choose the perfect MoonUI Design plan for your design needs. Access premium Figma and Framer templates, UI components, gradients, and designs with flexible pricing options.',
  keywords: ['MoonUI pricing', 'Figma templates pricing', 'UI kit subscription', 'design assets'],
  openGraph: {
    title: 'Pricing — MoonUI Design',
    description:
      'Choose the perfect plan for access to premium UI components, templates, and design assets.',
    url: 'https://moonui.design/pricing',
  },
  alternates: {
    canonical: 'https://moonui.design/pricing',
  },
};

export default async function Page() {
  const activeDiscount = await getActiveDiscount();

  return (
    <>
      <PricingSection activeDiscount={activeDiscount} />
      <NewsletterSection />
    </>
  );
}
