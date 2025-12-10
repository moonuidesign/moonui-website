import { Figma } from 'iconsax-reactjs';
import { Component, LayoutGrid, LayoutTemplate } from 'lucide-react';
import { ShowcaseTabItem } from './interactive-show-case';

export const DATA_TABS: ShowcaseTabItem[] = [
  {
    id: 'base',
    label: 'Base Components',
    subLabel: '40+ open-source components',
    tag: { text: 'FREE', variant: 'default' },
    icon: <LayoutGrid />,
    image:
      'https://images.unsplash.com/photo-1761839262867-af53d08b0eb5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'blocks',
    label: 'Components & Blocks',
    subLabel: '100+ ready-made blocks',
    tag: { text: 'PRO', variant: 'pro' },
    icon: <Component />,
    image:
      'https://images.unsplash.com/photo-1761839262867-af53d08b0eb5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'templates',
    label: 'Sectoral Templates',
    subLabel: 'Designs for various needs',
    tag: { text: 'PRO', variant: 'pro' },
    icon: <LayoutTemplate />,
    image:
      'https://images.unsplash.com/photo-1761839262867-af53d08b0eb5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'figma',
    label: 'Aligned with Figma',
    subLabel: 'Sync design to code',
    tag: { text: 'PRO', variant: 'pro' },
    icon: <Figma />,
    image:
      'https://images.unsplash.com/photo-1761839262867-af53d08b0eb5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];
