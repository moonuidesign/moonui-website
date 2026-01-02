'use client';
import React, { FormEvent, useState, useTransition } from 'react';
import { Mail, Check, FileText, CornerDownLeft, Loader2 } from 'lucide-react';
import { subscribeToNewsletter } from '@/server-action/newsletter';
import { toast } from 'react-toastify';

// --- Types & Interfaces ---

interface NewsletterProps {
  badgeText?: string;
  title?: string;
  description?: React.ReactNode;
  placeholder?: string;
  features?: string[];
  onSubscribe?: (email: string) => void;
}

const Badge = ({ text }: { text: string }) => (
  <div className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-orange-600 py-1.5 pr-3 pl-2 shadow-sm">
    <FileText className="h-3.5 w-3.5 text-white" strokeWidth={3} />
    <span className="font-sans text-sm leading-5 font-medium text-white">{text}</span>
  </div>
);

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2">
    <div className="flex h-4 w-4 items-center justify-center rounded-full border border-green-600/30">
      <Check className="h-2.5 w-2.5 text-green-600" strokeWidth={4} />
    </div>
    <span className="font-sans text-sm leading-5 font-medium text-[#3D3D3D]">{text}</span>
  </div>
);

const NewsletterSection: React.FC<NewsletterProps> = ({
  badgeText = 'Stay Informed',
  title = 'Subscribe to our newsletter',
  placeholder = 'Enter your email...',
  description,
  features = ['Weekly updates', 'Early access for features', 'Exclusive content'],
  onSubscribe,
}) => {
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (onSubscribe && email) {
      onSubscribe(email);
      setEmail('');
      return;
    }

    if (!email) return;

    startTransition(async () => {
      const result = await subscribeToNewsletter(email);
      if (result.success) {
        toast.success(result.success);
        setEmail('');
      } else {
        toast.error(result.error || 'Failed to subscribe');
      }
    });
  };

  return (
    <section className="relative container mx-auto mt-0 flex w-full items-center justify-center rounded-t-4xl border-[#D3D3D3] px-4 py-10 md:mt-10 md:border-x md:border-t md:py-10 lg:w-7xl">
      <span className="absolute bottom-0 -left-[3px] hidden h-1.5 w-1.5 rounded-full bg-[#D3D3D3] md:block" />
      <span className="absolute -right-[3.5px] bottom-0 hidden h-1.5 w-1.5 rounded-full bg-[#D3D3D3] md:block" />

      <div className="pointer-events-none absolute inset-0 mx-auto hidden w-full opacity-50 md:max-w-[1280px] xl:block" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="flex flex-col items-start gap-4 text-start md:items-center md:text-center">
          <Badge text={badgeText} />

          <div className="flex flex-col gap-2">
            <h2 className="font-sans text-[28px] leading-tight font-semibold text-[#3D3D3D] md:text-4xl md:text-[30px]">
              {title}
            </h2>
            <div className="mx-auto max-w-lg text-base leading-7">
              {description || (
                <p>
                  <span className="font-normal text-neutral-500">Get the </span>
                  <span className="font-medium text-[#3D3D3D]">latest updates</span>
                  <span className="font-normal text-neutral-500">, </span>
                  <span className="font-medium text-[#3D3D3D]">tips</span>
                  <span className="font-normal text-neutral-500">, and </span>
                  <span className="font-medium text-[#3D3D3D]">exclusive</span>
                  <span className="font-normal text-neutral-500"> offers from MoonUI.</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-md flex-col items-center gap-3">
          <form
            onSubmit={handleSubmit}
            className="flex h-12 w-full items-center gap-3 rounded-xl bg-neutral-100 pr-2 pl-3 shadow-[0px_4px_8px_-1.5px_rgba(51,51,51,0.06)] ring-1 ring-zinc-200 transition-all duration-200 focus-within:shadow-md focus-within:ring-[#FF4F00]"
          >
            <Mail className="h-5 w-5 text-zinc-400" />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="flex-1 border-none bg-transparent font-sans text-base text-[#3D3D3D] outline-none placeholder:text-neutral-400"
              required
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending}
              className="group flex h-6 w-8 cursor-pointer items-center justify-center rounded-[5px] border border-neutral-200 bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-transform hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Submit"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
              ) : (
                <CornerDownLeft className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-600" />
              )}
            </button>
          </form>

          <p className="text-left font-sans text-sm font-normal text-neutral-400 md:text-center">
            We respect your privacy
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-center md:gap-y-2 lg:gap-x-6">
          {features.map((feature, index) => (
            <FeatureItem key={index} text={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
