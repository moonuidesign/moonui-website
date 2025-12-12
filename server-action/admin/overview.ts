'use server';

import { db } from '@/libs/drizzle';
import {
  contentTemplates,
  contentDesigns,
  contentComponents,
} from '@/db/migration';
import { count, desc, eq, sql } from 'drizzle-orm';
import { auth } from '@/libs/auth';

export interface ContentStats {
  total: number;
  totalViews: number;
  totalDownloads: number; // or copies for components
  mostPopular: {
    title: string;
    count: number;
  } | null;
  freeCount: number;
  proCount: number;
}

export interface OverviewStats {
  templates: ContentStats;
  designs: ContentStats;
  components: ContentStats;
  grandTotal: {
    items: number;
    views: number;
    interactions: number; // downloads + copies
  };
}

export async function getOverviewStats(): Promise<OverviewStats | null> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.roleUser !== 'admin' &&
      session.user.roleUser !== 'superadmin')
  ) {
    return null;
  }

  // --- Templates Stats ---
  const templatesCount = await db
    .select({
      count: count(),
      totalViews: sql<number>`sum(${contentTemplates.viewCount})`,
      totalDownloads: sql<number>`sum(${contentTemplates.downloadCount})`,
      freeCount: sql<number>`sum(case when ${contentTemplates.tier} = 'free' then 1 else 0 end)`,
      proCount: sql<number>`sum(case when ${contentTemplates.tier} = 'pro' then 1 else 0 end)`,
    })
    .from(contentTemplates);

  const topTemplate = await db
    .select({ title: contentTemplates.title, count: contentTemplates.downloadCount })
    .from(contentTemplates)
    .orderBy(desc(contentTemplates.downloadCount))
    .limit(1);

  // --- Designs Stats ---
  const designsCount = await db
    .select({
      count: count(),
      totalViews: sql<number>`sum(${contentDesigns.viewCount})`,
      totalDownloads: sql<number>`sum(${contentDesigns.downloadCount})`,
      freeCount: sql<number>`sum(case when ${contentDesigns.tier} = 'free' then 1 else 0 end)`,
      proCount: sql<number>`sum(case when ${contentDesigns.tier} = 'pro' then 1 else 0 end)`,
    })
    .from(contentDesigns);

  const topDesign = await db
    .select({ title: contentDesigns.title, count: contentDesigns.downloadCount })
    .from(contentDesigns)
    .orderBy(desc(contentDesigns.downloadCount))
    .limit(1);

  // --- Components Stats ---
  const componentsCount = await db
    .select({
      count: count(),
      totalViews: sql<number>`sum(${contentComponents.viewCount})`,
      totalCopies: sql<number>`sum(${contentComponents.copyCount})`,
      freeCount: sql<number>`sum(case when ${contentComponents.tier} = 'free' then 1 else 0 end)`,
      proCount: sql<number>`sum(case when ${contentComponents.tier} = 'pro' then 1 else 0 end)`,
    })
    .from(contentComponents);

  const topComponent = await db
    .select({ title: contentComponents.title, count: contentComponents.copyCount })
    .from(contentComponents)
    .orderBy(desc(contentComponents.copyCount))
    .limit(1);

  // --- Aggregation ---
  const tStats = templatesCount[0];
  const dStats = designsCount[0];
  const cStats = componentsCount[0];

  return {
    templates: {
      total: Number(tStats?.count || 0),
      totalViews: Number(tStats?.totalViews || 0),
      totalDownloads: Number(tStats?.totalDownloads || 0),
      mostPopular: topTemplate[0] ? { title: topTemplate[0].title, count: topTemplate[0].count || 0 } : null,
      freeCount: Number(tStats?.freeCount || 0),
      proCount: Number(tStats?.proCount || 0),
    },
    designs: {
      total: Number(dStats?.count || 0),
      totalViews: Number(dStats?.totalViews || 0),
      totalDownloads: Number(dStats?.totalDownloads || 0),
      mostPopular: topDesign[0] ? { title: topDesign[0].title, count: topDesign[0].count || 0 } : null,
      freeCount: Number(dStats?.freeCount || 0),
      proCount: Number(dStats?.proCount || 0),
    },
    components: {
      total: Number(cStats?.count || 0),
      totalViews: Number(cStats?.totalViews || 0),
      totalDownloads: Number(cStats?.totalCopies || 0), // Mapping copy to download for uniform interface if desired, or keep distinct in UI
      mostPopular: topComponent[0] ? { title: topComponent[0].title, count: topComponent[0].count || 0 } : null,
      freeCount: Number(cStats?.freeCount || 0),
      proCount: Number(cStats?.proCount || 0),
    },
    grandTotal: {
      items: Number(tStats?.count || 0) + Number(dStats?.count || 0) + Number(cStats?.count || 0),
      views: Number(tStats?.totalViews || 0) + Number(dStats?.totalViews || 0) + Number(cStats?.totalViews || 0),
      interactions: Number(tStats?.totalDownloads || 0) + Number(dStats?.totalDownloads || 0) + Number(cStats?.totalCopies || 0),
    },
  };
}
