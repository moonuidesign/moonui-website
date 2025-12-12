import Link from 'next/link';
export const SocialButton = ({
  icon,
  href = '#',
  activeColor = 'bg-neutral-100',
}: {
  icon: React.ReactNode;
  href?: string;
  activeColor?: string;
}) => (
  <Link
    href={href}
    className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-transform hover:-translate-y-1 ${activeColor}`}
  >
    {icon}
  </Link>
);
