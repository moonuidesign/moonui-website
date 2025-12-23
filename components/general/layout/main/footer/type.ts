import { ReactNode } from 'react';

export interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  icon: ReactNode;
  href: string;
  label: string;
}

export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  columns?: FooterColumn[];
  email?: string;
  copyright?: string;
  socials?: {
    x?: string;
    linkedin?: string;
    instagram?: string;
  };
}
