import React from 'react';
import Link from 'next/link';

export const SocialButton = ({
  icon,
  href = '#',
}: {
  icon: React.ReactNode;
  href?: string;
  activeColor?: string;
}) => (
  <Link
    href={href}
    className="group/social z-30 inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 shadow-[0px_0px_0px_1px_rgba(51,51,51,0.10),0px_48px_48px_-24px_rgba(51,51,51,0.04),0px_24px_24px_-12px_rgba(51,51,51,0.04),0px_12px_12px_-6px_rgba(51,51,51,0.04),0px_6px_6px_-3px_rgba(51,51,51,0.04),0px_3px_3px_-1.5px_rgba(51,51,51,0.02),0px_1px_1px_0.5px_rgba(51,51,51,0.04),inset_0px_-1px_1px_-0.5px_rgba(51,51,51,0.06)] hover:bg-[#FF4F00]"
  >
    <span className="flex items-center justify-center text-[#B8B8B8] transition-colors duration-200 group-hover/social:text-white">
      {icon}
    </span>
  </Link>
);
