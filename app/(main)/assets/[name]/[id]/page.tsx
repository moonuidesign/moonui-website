import ContentDetailClient from '@/components/detail-assets';
import { auth } from '@/libs/auth';
import { db } from '@/libs/drizzle';
import { UnifiedContent } from '@/types/assets';
import { and, asc, desc, eq, gt, lt, ne, count, lte } from 'drizzle-orm';
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

const DB_CONFIG = {
  templates: {
    contentTable: contentTemplates,
    categoryTable: categoryTemplates,
    fkId: contentTemplates.categoryTemplatesId,
    relationKey: 'contentTemplates',
  },
  components: {
    contentTable: contentComponents,
    categoryTable: categoryComponents,
    fkId: contentComponents.categoryComponentsId,
    relationKey: 'contentComponents',
  },
  designs: {
    contentTable: contentDesigns,
    categoryTable: categoryDesigns,
    fkId: contentDesigns.categoryDesignsId,
    relationKey: 'contentDesigns',
  },
  gradients: {
    contentTable: contentGradients,
    categoryTable: categoryGradients,
    fkId: contentGradients.categoryGradientsId,
    relationKey: 'contentGradients',
  },
};

type ContentTypeParam = keyof typeof DB_CONFIG;
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
  const slug = typeof data.slug === 'string' ? data.slug : data.slug?.current;
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
    type: type,
    viewCount: data.viewCount || 0,
    downloadCount: data.downloadCount || 0,
    copyCount: data.copyCount || 0,
    linkTemplate: data.linkTemplate,
    linkDownload: data.linkDonwload || data.linkDownload,
    codeSnippets: data.codeSnippets || null,
    urlPreview: data.urlPreview || null,
    platform: data.platform || 'Web',
    category: catData
      ? {
          id: catData.id,
          name: catData.name,
          parentId: catData.parentId,
        }
      : null,
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

  // Fetch Item Utama
  // @ts-ignore
  const currentItemRaw = await db.query[config.relationKey].findFirst({
    where: eq(config.contentTable.id, id),
    with: { category: true },
  });

  if (!currentItemRaw) return notFound();

  return await renderPage(currentItemRaw, unifiedType, config, name, id, user);
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

  const [
    rankResult,
    prevItemsRaw,
    nextItemsRaw,
    relevantItemsRaw,
    popularItemsRaw,
  ] = await Promise.all([
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
      .orderBy(
        desc(
          (contentTable as any).downloadCount ||
            (contentTable as any).viewCount,
        ),
      )
      .limit(3),
  ]);

  // Update nomor urut berdasarkan posisi global di DB
  if (rankResult[0]) {
    content.number = rankResult[0].value;
  }
  const normalizeJoin = (row: any) => {
    if (!row) return null;
    const values = Object.values(row);
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
      userTier={user?.user?.tier === 'pro_plus' ? 'pro_plus' : 'free'}
    />
  );
}
