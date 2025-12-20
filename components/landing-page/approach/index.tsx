import { Figma } from 'iconsax-reactjs';
import {
  Component,
  LayoutGrid,
  LayoutTemplate,
  Briefcase,
  Landmark,
  Megaphone,
  Bitcoin,
  Bot,
} from 'lucide-react';
import { ShowcaseTabItem } from './interactive-show-case';

export const DATA_TABS: ShowcaseTabItem[] = [
  {
    id: 'base',
    label: 'Base Components',
    subLabel: '40+ open-source components',
    tag: { text: 'FREE', variant: 'default' },
    icon: <LayoutGrid />,
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',

    ctaTitle: 'Start Building Today',
    ctaDescription: 'Explore our component library.',
    ctaButtonText: 'Browse Components',
    footerStyle: 'default', // Style bulat melayang
  },
  {
    id: 'blocks',
    label: 'Components & Blocks',
    subLabel: '100+ ready-made blocks',
    tag: { text: 'PRO', variant: 'pro' },
    icon: <Component />,
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
    ctaTitle: 'Premium Components & Blocks',
    ctaDescription:
      'Unlock 100+ premium components and blocks for advanced projects.',
    ctaButtonText: 'Explore - AlignUI PRO',
    footerStyle: 'simple-dark', // Style baru seperti gambar component & block
    buttonColor: 'bg-[#FF5F38]', // Warna Orange khusus
  },
  {
    id: 'templates',
    label: 'Sectoral Templates',
    subLabel: 'Designs for various needs',
    tag: { text: 'PRO', variant: 'pro' },
    icon: <LayoutTemplate />,
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
    footerStyle: 'tabbed-dark', // Style dengan sub-menu
    subTabs: [
      {
        id: 'hr',
        label: 'HR Management',
        icon: <Briefcase size={14} />,
        title: 'HR Management Template',
        description: 'Streamline your recruitment and employee management.',
        image:
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop',
        color: 'bg-emerald-600', // Warna Hijau
      },
      {
        id: 'finance',
        label: 'Finance & Banking',
        icon: <Landmark size={14} />,
        title: 'Finance & Banking Template',
        description:
          'Financial management tools & marketing analytics with integrated CRM features.',
        image:
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop',
        color: 'bg-blue-600', // Warna Biru
      },
      {
        id: 'marketing',
        label: 'Marketing & Sales',
        icon: <Megaphone size={14} />,
        title: 'Marketing Dashboard',
        description: 'Campaign tracking and conversion analytics in one place.',
        image:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
        color: 'bg-purple-600', // Warna Ungu
      },
      {
        id: 'crypto',
        label: 'Cryptocurrency',
        icon: <Bitcoin size={14} />,
        isSoon: true,
        title: 'Crypto Exchange',
        description: 'Secure trading platform template coming soon.',
        image:
          'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=2069&auto=format&fit=crop',
        color: 'bg-orange-500', // Warna Orange
      },
      {
        id: 'ai',
        label: 'AI Product',
        icon: <Bot size={14} />,
        isSoon: true,
        title: 'AI SaaS Platform',
        description: 'Next-gen AI interface template coming soon.',
        image:
          'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop',
        color: 'bg-rose-600', // Warna Merah Muda
      },
    ],
  },
  {
    id: 'figma',
    label: 'Aligned with Figma',
    subLabel: 'Sync design to code',
    tag: { text: 'PRO', variant: 'pro' },
    icon: <Figma />,
    image:
      'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=2070&auto=format&fit=crop',
    ctaTitle: 'Design System',
    ctaDescription:
      'Keep your design and code perfectly aligned with our Figma kit.',
    ctaButtonText: 'Get Figma Kit',
    footerStyle: 'simple-dark', // Style baru
    buttonColor: 'bg-[#FF5F38]', // Warna Orange
  },
];
