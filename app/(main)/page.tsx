import { auth } from '@/libs/auth';
import { db } from '@/libs/drizzle';
import LandingPage from '@/modules/landing-page';
import type { Metadata } from 'next';

import { categoryComponents, categoryDesigns, contentTemplates } from '@tables';
import { desc } from 'drizzle-orm';

// Revalidate every 60 seconds for fresh content while enabling caching
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'MoonUI Design — We Build Your Premium Design Library',
  description:
    'Discover premium UI components, templates, gradients, and designs for Figma and Framer. Build stunning interfaces faster with MoonUI Design — flexible assets, consistent UI, quick MVP launch.',
  keywords: [
    'UI components',
    'Figma templates',
    'Framer templates',
    'UI kit',
    'design system',
    'gradients',
    'premium UI',
    'MoonUI Design',
  ],
  openGraph: {
    title: 'MoonUI Design — We Build Your Premium Design Library',
    description:
      'Build stunning interfaces faster with premium UI components, templates, and gradients.',
    url: 'https://moonui.design',
    type: 'website',
  },
  alternates: {
    canonical: 'https://moonui.design',
  },
};

export default async function Home() {
  const _session = await auth();
  const [components, templates, designs] = await Promise.all([
    db.select().from(categoryComponents).limit(2).orderBy(desc(categoryComponents.createdAt)),
    db.select().from(contentTemplates).limit(2).orderBy(desc(contentTemplates.createdAt)),
    db.select().from(categoryDesigns).limit(2).orderBy(desc(categoryDesigns.createdAt)),
  ]);

  const showcaseData = [
    ...components.map((c) => ({
      id: c.id,
      title: c.name,
      blocks: 'Component',
      image: c.imageUrl || 'https://placehold.co/270x220',
    })),
    ...templates.map((t) => {
      const imgs = t.imagesUrl as string[];
      return {
        id: t.id,
        title: t.title,
        blocks: t.tier === 'pro' ? 'Pro Template' : 'Free Template',
        image: Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : 'https://placehold.co/270x220',
      };
    }),
    ...designs.map((d) => ({
      id: d.id,
      title: d.name,
      blocks: 'Design',
      image: d.imageUrl || 'https://placehold.co/270x220',
    })),
  ];

  return <LandingPage showcaseData={showcaseData} />;
}
