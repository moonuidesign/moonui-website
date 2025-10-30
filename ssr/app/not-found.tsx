import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  ChevronRight,
  Dribbble,
  EqualApproximatelyIcon,
  FacebookIcon,
  Instagram,
  Mail,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function NotFound() {
  return (
    <div className="flex min-h-screen relative items-end py-10 overflow-hidden justify-center bg-[#E8E8E8] font-sans dark:bg-black">
      <Image
        src="/moonNotFound.png"
        className=" absolute top-[200px] -rotate-65 "
        alt="Not Found"
        style={{
          opacity: 0.25,
        }}
        width={1400}
        height={1200}
      />
      <div className="flex flex-col  w-full h-full justify-center items-center gap-6 text-center z-10 px-5">
        <h1 className=" text-[300px] font-semibold leading-80 text-black dark:text-zinc-50">
          404
        </h1>
        <h2 className="text-[30px] font-semibold">
          We’re almost ready to launch
        </h2>
        <h3 className="text-[18px] font-light">
          Get the latest updates, tips, and exclusive offers from MoonUI Design.
        </h3>
        <div className="flex flex-col gap-3 items-center">
          <div className="p-2 bg-white rounded-xl flex items-center gap-3 shadow-md">
            <span>
              <Mail className="text-[#E8E8E8]" size={30} />
            </span>
            <Input
              className="outline-none border-none w-[290px] focus-visible:ring-0 shadow-none focus-visible:border-none"
              placeholder="Enter your email"
            />
            <button className="bg-white border-[#E8E8E8] border-2 text-[#E8E8E8] rounded-md px-2">
              <ChevronRight />
            </button>
          </div>
          <span className="text-[14px] text-[#8A7F8D]">
            We respect your inbox. Privacy policy
          </span>
        </div>
        <div className="flex gap-4 mt-28">
          <Link
            href="/"
            className="flex rounded-2xl items-center gap-2 p-3 bg-[#8A7F8D] text-white"
          >
            <X />
          </Link>
          <Link
            href="/"
            className="flex rounded-2xl items-center gap-2 p-3 text-[#8A7F8D] bg-white"
          >
            <Instagram />
          </Link>
          <Link
            href="/"
            className="flex rounded-2xl items-center gap- p-3 text-[#8A7F8D] bg-white"
          >
            <Dribbble />
          </Link>
        </div>
      </div>
    </div>
  );
}
