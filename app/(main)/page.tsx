import { auth } from '@/libs/auth';
import { db } from '@/libs/drizzle';
import LandingPage from '@/modules/landing-page';

import { categoryComponents, categoryDesigns, contentTemplates } from '@tables';
import { desc } from 'drizzle-orm';

export default async function Home() {
  const session = await auth();
  console.log(session);
  const [components, templates, designs] = await Promise.all([
    db
      .select()
      .from(categoryComponents)
      .limit(2)
      .orderBy(desc(categoryComponents.createdAt)),
    db
      .select()
      .from(contentTemplates)
      .limit(2)
      .orderBy(desc(contentTemplates.createdAt)),
    db
      .select()
      .from(categoryDesigns)
      .limit(2)
      .orderBy(desc(categoryDesigns.createdAt)),
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
        image:
          Array.isArray(imgs) && imgs.length > 0
            ? imgs[0]
            : 'https://placehold.co/270x220',
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
