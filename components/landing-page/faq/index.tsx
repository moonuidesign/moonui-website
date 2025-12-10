import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../ui/accordion';

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
  return (
    <section className="w-full lg:w-max-7xl mx-auto container py-20 bg-[E8E8E8] flex justify-center items-center px-1 md:p-4">
      {/* Container Utama (Dark Card) */}
      <div className="w-full rounded-4xl bg-zinc-900  lg:rounded-[40px] shadow-xl p-8 md:p-16 flex flex-col lg:flex-row gap-10 lg:gap-20">
        {/* Bagian Kiri: Header Text */}
        <div className="w-full lg:w-96 flex flex-col items-start gap-2 h-fit  top-10">
          <span className="text-neutral-400 text-[16px] md:text-base font-medium leading-6">
            {label}
          </span>
          <h2 className="text-white text-[36px] md:text-5xl font-semibold leading-tight mb-2">
            {title.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </h2>
          <p className="text-neutral-400 text-[16px] text-base leading-6">
            {description}
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-14">
          {categories.map((category, catIndex) => (
            <div key={catIndex} className="flex flex-col gap-5">
              {/* Nama Kategori */}
              <h3 className="text-neutral-400 text-[16px] md:text-base font-medium leading-6">
                {category.categoryName}
              </h3>

              <Accordion
                type="single"
                collapsible
                className="w-full flex flex-col gap-0"
              >
                {category.items.map((item, itemIndex) => (
                  <AccordionItem
                    key={itemIndex}
                    value={`${category.categoryName}-${itemIndex}`}
                    className="border-zinc-800 border-b last:border-b-0"
                  >
                    <AccordionTrigger className="text-white text-[16px] text-left md:text-base font-medium py-4 hover:no-underline hover:text-neutral-300 transition-colors [&[data-state=open]>svg]:rotate-180">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-neutral-400 text-[14px] md:text-base leading-7 pb-6">
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
