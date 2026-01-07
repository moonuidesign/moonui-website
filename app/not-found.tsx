'use client';
import FuzzyText from '@/components/FuzzyText';
import RootLayout from '@/components/general/layout/root';
import { Input } from '@/components/ui/input';
import { ChevronRight, Mail, Loader2, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { subscribeToNewsletter } from '@/server-action/newsletter';
import { SocialButton } from '@/components/general/layout/main/footer/social-button';
import {
  InstagramIcon,
  LinkedInIcon,
  XIcon,
} from '@/components/general/layout/main/footer/social-icons';

export default function NotFound() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await subscribeToNewsletter(email);
      if (result.success) {
        setMessage({ type: 'success', text: result.success });
        setEmail('');
      } else if (result.error) {
        setMessage({ type: 'error', text: result.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const socials = {
    x: 'https://x.com/moonuidesign',
    instagram: 'https://instagram.com/moonuidesign',
    linkedin: 'https://linkedin.com/company/moonuidesign',
  };

  return (
    <RootLayout>
      <div className="relative container mx-auto flex h-full w-screen max-w-[1440px] flex-col items-center justify-between overflow-hidden bg-[#E8E8E8] p-4 font-sans dark:bg-black">
        <Image
          src="/moonNotFound.png"
          className="w-max-[1318.4px] h-max-[1142px] pointer-events-none absolute left-[49%] hidden -translate-x-1/2 scale-[1.6] -rotate-65 select-none md:-bottom-[200px] md:block md:h-[648px] md:w-[681px] lg:top-[270px] lg:h-[848px] lg:w-[879px]"
          alt="Not Found"
          style={{
            opacity: 0.25,
            zIndex: 0,
          }}
          priority
          width={1400}
          height={1200}
        />
        <div className="z-10 flex w-full flex-col items-center justify-center gap-6 px-5 text-center">
          <FuzzyText
            fontSize="300px"
            fontWeight="700"
            color="#2E2E2E"
            baseIntensity={0}
            hoverIntensity={0.5}
            enableHover={true}
          >
            404
          </FuzzyText>
          <div className="mt-10 flex flex-row items-center gap-1">
            <h2 className="font-sans text-[30px] font-semibold">We're almost ready to launch</h2>
            <Image src="/ic-rocket.svg" alt="rocket MoonUi" width={40} height={40} />
          </div>
          <div className="font-jakarta flex w-full flex-row items-center justify-center gap-1 text-[18px] font-light text-[#707070]">
            <p>Get</p>
            <div className="flex flex-row">
              <p className="font-medium text-[#2E2E2E]">latest updates</p>
              <p>,</p>
            </div>
            <div className="flex flex-row">
              <p className="font-medium text-[#2E2E2E]">tips</p>
              <p>,</p>
            </div>
            <p>and</p>
            <p className="font-medium text-[#2E2E2E]">exclusive</p>
            <p>offers from MoonUI Design.</p>
          </div>
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-white p-2 shadow-md">
              <span>
                <Mail className="text-[#E8E8E8]" size={30} />
              </span>
              <Input
                className="w-[290px] border-none shadow-none outline-none focus-visible:border-none focus-visible:ring-0"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={isLoading}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="rounded-md border-2 border-[#E8E8E8] px-2 text-[#E8E8E8] transition-colors hover:border-[#FF4F00] hover:text-[#FF4F00] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : message?.type === 'success' ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <ChevronRight />
                )}
              </button>
            </div>
            {message && (
              <span
                className={`text-[14px] ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}
              >
                {message.text}
              </span>
            )}
            <span className="text-[14px] text-[#8A7F8D]">
              We respect your inbox.{' '}
              <Link href="/privacy-policy" className="underline hover:text-[#FF4F00]">
                Privacy policy
              </Link>
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <SocialButton href={socials?.x} icon={<XIcon className="h-4 w-4" />} />
          <SocialButton href={socials?.instagram} icon={<InstagramIcon className="h-4 w-4" />} />
          <SocialButton href={socials?.linkedin} icon={<LinkedInIcon className="h-4 w-4" />} />
        </div>
      </div>
    </RootLayout>
  );
}
