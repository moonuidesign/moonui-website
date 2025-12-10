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
  <div className="h-8 pl-2 pr-3 py-1.5 bg-orange-600 rounded-lg shadow-[0px_0px_0px_1px_rgba(41,41,41,0.08)] shadow-[0px_1px_2px_0px_rgba(41,41,41,0.04)] shadow-[0px_2px_4px_0px_rgba(41,41,41,0.04)] shadow-[0px_4px_8px_0px_rgba(41,41,41,0.06)] shadow-[inset_0px_-0.5px_0.5px_0px_rgba(41,41,41,0.08)] inline-flex items-center gap-1.5">
    <FileText className="w-3.5 h-3.5 text-white" strokeWidth={3} />
    <span className="text-white text-sm font-medium font-sans leading-5">
      {text}
    </span>
  </div>
);

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 flex items-center justify-center rounded-full border border-green-600/30">
      <Check className="w-2.5 h-2.5 text-green-600" strokeWidth={4} />
    </div>
    <span className="text-zinc-800 text-sm font-medium font-sans leading-5">
      {text}
    </span>
  </div>
);

const NewsletterSection: React.FC<NewsletterProps> = ({
  badgeText = 'Stay Informed',
  title = 'Subscribe to our newsletter',
  placeholder = 'Enter your email...',
  description,
  features = [
    'Weekly updates',
    'Early access for features',
    'Exclusive content',
  ],
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
    <section className="w-full bg-gray-200 py-20 px-4 flex justify-center items-center overflow-hidden relative">
      <div className="hidden xl:block absolute inset-0 pointer-events-none border-x border-neutral-300 w-full max-w-[1280px] mx-auto opacity-50" />

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center gap-8">
        <div className="flex flex-col md:items-center gap-4 md:text-center items-start text-start">
          <Badge text={badgeText} />

          <div className="flex flex-col gap-2">
            <h2 className="text-zinc-800 text-3xl md:text-4xl font-semibold font-sans leading-tight">
              {title}
            </h2>
            <div className="text-base leading-7 max-w-lg mx-auto">
              {description || (
                <p>
                  <span className="text-neutral-500 font-normal">Get the </span>
                  <span className="text-zinc-800 font-medium">
                    latest updates
                  </span>
                  <span className="text-neutral-500 font-normal">, </span>
                  <span className="text-zinc-800 font-medium">tips</span>
                  <span className="text-neutral-500 font-normal">, and </span>
                  <span className="text-zinc-800 font-medium">exclusive</span>
                  <span className="text-neutral-500 font-normal">
                    {' '}
                    offers from MoonUI.
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="w-full max-w-md flex flex-col items-center gap-3">
          <form
            onSubmit={handleSubmit}
            className="w-full h-12 pl-3 pr-2 bg-neutral-100 rounded-xl shadow-[0px_4px_8px_-1.5px_rgba(51,51,51,0.06)] ring-1 ring-zinc-200 focus-within:ring-zinc-400 focus-within:shadow-md transition-all duration-200 flex items-center gap-3"
          >
            <Mail className="w-5 h-5 text-zinc-400" />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-none outline-none text-zinc-800 placeholder:text-neutral-400 text-base font-sans"
              required
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending}
              className="group w-8 h-8 bg-white hover:bg-zinc-50 rounded-[5px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-neutral-200 flex justify-center items-center cursor-pointer active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
              ) : (
                <CornerDownLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600" />
              )}
            </button>
          </form>

          <p className="text-neutral-400 text-sm md:text-center text-left font-normal font-sans">
            We respect your privacy
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:gap-x-6 md:gap-y-2 md:justify-center">
          {features.map((feature, index) => (
            <FeatureItem key={index} text={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
