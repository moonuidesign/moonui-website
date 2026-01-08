import NewsletterSection from '@/components/landing-page/newslatter';
import PricingSection from '@/components/pricing';
import { getActiveDiscount } from '@/server-action/action-discount';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const FAQSection = dynamic(() => import('@/components/landing-page/faq'), { ssr: true });

const faqData = [
  {
    categoryName: 'Design',
    items: [
      {
        question: 'Which version of Tailwind is being used?',
        answer:
          'We are currently using Tailwind CSS version 3.4. This ensures you have access to the latest utility classes and features including arbitrary values and the JIT engine.',
      },
      {
        question: 'Which version of React is being used?',
        answer:
          'The templates are built on React 18, leveraging the latest features like Server Components (if using Next.js) and concurrent rendering capabilities.',
      },
      {
        question: 'Does MoonUI have its own npm package?',
        answer:
          'Currently, MoonUI is a copy-paste component library similar to shadcn/ui. We do not package it as an npm dependency to give you full control over the code.',
      },
      {
        question: 'Can I use MoonUI with Vue, Svelte, or other frameworks?',
        answer:
          'While the code provided is React-specific, the styling logic relies on standard Tailwind CSS classes. You can easily adapt the HTML structure and classes to Vue or Svelte.',
      },
      {
        question: 'Do you provide JavaScript (non-TypeScript) snippets?',
        answer:
          'Yes, you can strip the type definitions manually, but we highly recommend using TypeScript for better maintainability and developer experience.',
      },
      {
        question: 'What sets MoonUI apart from other copy-paste libraries?',
        answer:
          'MoonUI focuses heavily on premium visual aesthetics, micro-interactions, and accessibility out of the box, ensuring your app feels polished from day one.',
      },
    ],
  },
  {
    categoryName: 'License',
    items: [
      {
        question: 'What license do the Base Components use?',
        answer:
          'All base components are released under the MIT License. You are free to use them in personal and commercial projects without attribution.',
      },
    ],
  },
];

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
      <FAQSection categories={faqData} />
      <NewsletterSection />
    </>
  );
}
