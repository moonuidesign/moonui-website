import ContentDetailClient from '@/components/detail-assets';
import { auth } from '@/libs/auth';
import { db } from '@/libs/drizzle';
import { UnifiedContent } from '@/types/assets';
import { and, asc, desc, eq, gt, lt, ne, count, lte, sql } from 'drizzle-orm';
import {
  contentTemplates,
  contentComponents,
  contentDesigns,
  contentGradients,
  categoryTemplates,
  categoryComponents,
  categoryDesigns,
  categoryGradients,
} from '@/db/migration';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const DB_CONFIG = {
  templates: {
    contentTable: contentTemplates,
    categoryTable: categoryTemplates,
    fkId: contentTemplates.categoryTemplatesId,
    relationKey: 'contentTemplates',
    label: 'Template',
  },
  components: {
    contentTable: contentComponents,
    categoryTable: categoryComponents,
    fkId: contentComponents.categoryComponentsId,
    relationKey: 'contentComponents',
    label: 'Component',
  },
  designs: {
    contentTable: contentDesigns,
    categoryTable: categoryDesigns,
    fkId: contentDesigns.categoryDesignsId,
    relationKey: 'contentDesigns',
    label: 'Design',
  },
  gradients: {
    contentTable: contentGradients,
    categoryTable: categoryGradients,
    fkId: contentGradients.categoryGradientsId,
    relationKey: 'contentGradients',
    label: 'Gradient',
  },
};

type ContentTypeParam = keyof typeof DB_CONFIG;

// Generate dynamic metadata for SEO per-page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string; id: string }>;
}): Promise<Metadata> {
  const { name, id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://moonui.design';

  if (!Object.keys(DB_CONFIG).includes(name)) {
    return { title: 'Not Found' };
  }

  const typeKey = name as ContentTypeParam;
  const config = DB_CONFIG[typeKey];

  try {
    // @ts-expect-error - dynamic relation key
    const item = await db.query[config.relationKey].findFirst({
      where: eq(config.contentTable.id, id),
      with: { category: true },
    });

    if (!item) {
      return { title: 'Not Found | MoonUI Design' };
    }

    const title = item.title || item.name;

    // Strip HTML tags from description if it contains HTML
    const stripHtml = (html: unknown): string => {
      if (typeof html !== 'string') return '';
      return html
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .replace(/&amp;/g, '&') // Replace &amp; with &
        .replace(/&lt;/g, '<') // Replace &lt; with <
        .replace(/&gt;/g, '>') // Replace &gt; with >
        .replace(/&quot;/g, '"') // Replace &quot; with "
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
    };

    const rawDescription = item.description;
    const cleanDescription =
      stripHtml(rawDescription) ||
      `Explore this premium ${config.label.toLowerCase()} from MoonUI Design. High-quality ${name} for Figma and Framer.`;

    // Get image URL
    let imageUrl = item.imageUrl || item.assetUrl;
    if (item.imagesUrl && Array.isArray(item.imagesUrl) && item.imagesUrl[0]) {
      imageUrl = typeof item.imagesUrl[0] === 'string' ? item.imagesUrl[0] : item.imagesUrl[0].url;
    }
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${imageUrl}`;
    }

    const categoryName = item.category?.name || '';

    return {
      title: `${title} — ${config.label}`,
      description: cleanDescription.slice(0, 160),
      keywords: [
        title,
        config.label,
        categoryName,
        'MoonUI Design',
        'Figma',
        'Framer',
        'UI',
      ].filter(Boolean),
      openGraph: {
        title: `${title} | MoonUI ${config.label}`,
        description: cleanDescription.slice(0, 160),
        url: `${baseUrl}/assets/${name}/${id}`,
        siteName: 'MoonUI',
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : undefined,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | MoonUI`,
        description: cleanDescription.slice(0, 160),
        images: imageUrl ? [imageUrl] : undefined,
      },
      alternates: {
        canonical: `${baseUrl}/assets/${name}/${id}`,
      },
    };
  } catch {
    return { title: 'Error' };
  }
}
function normalizeContent(
  data: any,
  type: UnifiedContent['type'],
  categoryOverride?: any,
): UnifiedContent {
  // --- Handle Images ---
  let imagesArr: any[] = [];
  let mainImageUrl = data.assetUrl || data.imageUrl || data.image;

  if (data.imagesUrl) {
    if (Array.isArray(data.imagesUrl)) {
      imagesArr = data.imagesUrl;
      if (!mainImageUrl) mainImageUrl = data.imagesUrl[0];
    } else if (typeof data.imagesUrl === 'string') {
      imagesArr = [data.imagesUrl];
      if (!mainImageUrl) mainImageUrl = data.imagesUrl;
    }
  } else if (mainImageUrl) {
    imagesArr = [mainImageUrl];
  }

  const formattedImages = imagesArr.map((img: any) => {
    let rawUrl = '';
    if (typeof img === 'string') rawUrl = img;
    else if (typeof img === 'object' && img?.url) rawUrl = img.url;

    if (!rawUrl) return { url: '' };
    if (rawUrl.startsWith('http') || rawUrl.startsWith('/')) {
      return { url: rawUrl };
    }
    return {
      url: `https://${process.env.R2_PUBLIC_DOMAIN}/${rawUrl}`,
    };
  });
  // Keep slug as original format (array from DB)
  const slug = data.slug;
  const catData =
    categoryOverride ||
    data.category ||
    data.categoryTemplate ||
    data.categoryComponent ||
    data.categoryDesign ||
    data.categoryGradient;

  return {
    id: data.id,
    title: data.title || data.name,
    description: data.description || null,
    slug: slug,
    imageUrl: mainImageUrl || null,
    images: formattedImages,
    tier: data.tier,
    format: data.format,
    size: data.size,
    number: data.number,
    copyDataHtml:
      typeof data.copyComponentTextHTML === 'string'
        ? data.copyComponentTextHTML
        : JSON.stringify(data.copyComponentTextHTML || ''),
    copyDataPlain:
      typeof data.copyComponentTextPlain === 'string'
        ? data.copyComponentTextPlain
        : JSON.stringify(data.copyComponentTextPlain || ''),
    type: type,
    viewCount: data.viewCount || 0,
    downloadCount: data.downloadCount || 0,
    copyCount: data.copyCount || 0,
    linkTemplate: data.linkTemplate,
    linkDownload: data.linkDonwload || data.linkDownload,
    codeSnippets: data.codeSnippets || null,
    platform: data.platform || 'Web',
    category: catData
      ? {
          id: catData.id,
          name: catData.name,
          parentId: catData.parentId,
        }
      : null,
    createdAt: data.createdAt || null,
  };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ name: string; id: string }>;
}) {
  const { name, id } = await params;
  const user = await auth();

  // Validasi Parameter URL
  if (!Object.keys(DB_CONFIG).includes(name)) {
    return notFound();
  }

  const typeKey = name as ContentTypeParam;
  const config = DB_CONFIG[typeKey];

  const typeMap: Record<ContentTypeParam, UnifiedContent['type']> = {
    templates: 'template',
    components: 'component',
    designs: 'design',
    gradients: 'gradient',
  };
  const unifiedType = typeMap[typeKey];

  try {
    // Fetch Item Utama - Using relational query
    // @ts-expect-error - dynamic relation key
    const currentItemRaw = await db.query[config.relationKey].findFirst({
      where: eq(config.contentTable.id, id),
      with: { category: true },
    });

    if (!currentItemRaw) return notFound();

    // Increment view count (fire and forget, don't await)
    db.update(config.contentTable)
      .set({ viewCount: sql`view_count + 1` } as any)
      .where(eq(config.contentTable.id, id))
      .execute()
      .catch((err) => console.error('[ViewCount] Failed to increment:', err));

    return await renderPage(currentItemRaw, unifiedType, config, name, id, user);
  } catch (error: any) {
    // Don't log notFound errors - they are expected
    if (error?.digest?.includes('NEXT_NOT_FOUND') || error?.digest?.includes('404')) {
      throw error;
    }
    console.error(`[ContentPage] Failed to fetch ${name}/${id}:`, error);
    return notFound();
  }
}

async function renderPage(
  currentItemRaw: any,
  type: UnifiedContent['type'],
  config: (typeof DB_CONFIG)[keyof typeof DB_CONFIG],
  name: string,
  id: string,
  user: any,
) {
  const content = normalizeContent(currentItemRaw, type);
  const currentNumber = content.number;
  const categoryId = content.category?.id || '';

  const { contentTable, categoryTable, fkId } = config;

  const [rankResult, prevItemsRaw, nextItemsRaw, relevantItemsRaw, popularItemsRaw] =
    await Promise.all([
      // A. RANK
      db
        .select({ value: count() })
        .from(contentTable)
        .where(lte(contentTable.number, currentNumber)),

      // B. PREVIOUS ITEM
      db
        .select()
        .from(contentTable)
        .leftJoin(categoryTable, eq(fkId, categoryTable.id))
        .where(lt(contentTable.number, currentNumber))
        .orderBy(desc(contentTable.number))
        .limit(1),

      // C. NEXT ITEM
      db
        .select()
        .from(contentTable)
        .leftJoin(categoryTable, eq(fkId, categoryTable.id))
        .where(gt(contentTable.number, currentNumber))
        .orderBy(asc(contentTable.number))
        .limit(1),

      // D. RELEVANT ITEMS
      db
        .select()
        .from(contentTable)
        .leftJoin(categoryTable, eq(fkId, categoryTable.id))
        .where(and(eq(fkId, categoryId), ne(contentTable.id, content.id)))
        .limit(3),

      // E. POPULAR ITEMS (FIXED)
      db
        .select()
        .from(contentTable)
        .leftJoin(categoryTable, eq(fkId, categoryTable.id))
        // Fix: Fallback to viewCount if downloadCount is undefined in schema
        .orderBy(desc((contentTable as any).downloadCount || (contentTable as any).viewCount))
        .limit(3),
    ]);

  // Update nomor urut berdasarkan posisi global di DB
  if (rankResult[0]) {
    content.number = rankResult[0].value;
  }
  const normalizeJoin = (row: any) => {
    if (!row) return null;
    const values = Object.values(row);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return normalizeContent(values[0], type, values[1]);
  };

  const prevItem = prevItemsRaw.length ? normalizeJoin(prevItemsRaw[0]) : null;
  const nextItem = nextItemsRaw.length ? normalizeJoin(nextItemsRaw[0]) : null;
  const relevantContent = relevantItemsRaw
    .map(normalizeJoin)
    .filter((item): item is UnifiedContent => item !== null);
  const popularContent = popularItemsRaw
    .map(normalizeJoin)
    .filter((item): item is UnifiedContent => item !== null);

  return (
    <ContentDetailClient
      content={content}
      type={name}
      assetId={id}
      prevItem={prevItem}
      nextItem={nextItem}
      relevantContent={relevantContent}
      popularContent={popularContent}
      userTier={user?.user?.tier || 'free'}
    />
  );
}
