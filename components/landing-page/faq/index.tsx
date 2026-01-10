'use client';
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { usePathname } from 'next/navigation';

interface FAQSectionProps {
  label?: string;
  title?: string;
  description?: string;
  categories: {
    categoryName: string;
    items: {
      question: string;
      answer: string;
    }[];
  }[];
}

const FAQSection: React.FC<FAQSectionProps> = ({
  label = 'F.A.Q',
  title = 'Frequently Asked Questions.',
  description = 'Get answers to commonly asked questions.',
  categories,
}) => {
  const pathname = usePathname();
  const isPricingPage = pathname === '/pricing';
  return (
    <section
      className={`${isPricingPage ? 'lg:max-w-6xl' : 'lg:max-w-7xl'} container mx-auto flex w-full items-center justify-center px-1 py-5`}
    >
      {/* Container Utama (Dark Card) */}
      <div className="flex w-full flex-col gap-10 rounded-4xl bg-zinc-900 p-8 shadow-xl md:p-16 lg:flex-row lg:gap-20 lg:rounded-[40px]">
        {/* Bagian Kiri: Header Text */}
        <div className="top-10 flex h-fit w-full flex-col items-start gap-2 lg:w-96">
          <span className="text-[16px] leading-6 font-medium text-neutral-400 md:text-base">
            {label}
          </span>
          <h2 className="font-jakarta mb-2 text-[36px] leading-tight font-semibold text-white md:text-5xl">
            {title.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </h2>
          <p className="text-base text-[16px] leading-6 text-neutral-400">{description}</p>
        </div>
        <div className="flex flex-1 flex-col gap-14">
          {categories.map((category, catIndex) => (
            <div key={catIndex} className="flex flex-col gap-5">
              {/* Nama Kategori */}
              <h3 className="text-[16px] leading-6 font-medium text-neutral-400 md:text-base">
                {category.categoryName}
              </h3>

              <Accordion type="single" collapsible className="flex w-full flex-col gap-0">
                {category.items.map((item, itemIndex) => (
                  <AccordionItem
                    key={`cat-${catIndex}-item-${itemIndex}`}
                    value={`item-${catIndex}-${itemIndex}`}
                    className="border-b border-zinc-800 last:border-b-0"
                  >
                    <AccordionTrigger className="py-4 text-left text-[16px] font-medium text-white transition-colors hover:text-neutral-300 hover:no-underline md:text-base [&[data-state=open]>svg]:rotate-180">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 text-[14px] leading-7 text-neutral-400 md:text-base">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
