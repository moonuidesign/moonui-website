import ContentDetailClient from '@/components/detail-assets';
import {
  categoryComponents,
  categoryDesigns,
  categoryGradients,
  categoryTemplates,
  contentComponents,
  contentDesigns,
  contentGradients,
  contentTemplates,
} from '@/db/migration';
import { auth } from '@/libs/auth';
import { db } from '@/libs/drizzle';
import { UnifiedContent } from '@/types/assets';
import { and, asc, desc, eq, gt, lt, ne } from 'drizzle-orm';

import { notFound } from 'next/navigation';

function normalizeContent(
  data: any,
  type: UnifiedContent['type'],
): UnifiedContent {
  const content =
    data.content_templates ||
    data.content_components ||
    data.content_gradients ||
    data.content_designs;
  const category =
    data.category_templates ||
    data.category_components ||
    data.category_gradients ||
    data.category_designs;

  return {
    id: content.id,
    title: content.title || content.name, // Gradients use name
    description: content.description || null,
    slug: content.slug,
    imageUrl: content.assetUrl || content.imageUrl || content.image, // Handle different field names
    tier: content.tier,
    number: content.number,
    type: type,
    viewCount: content.viewCount || 0,
    downloadCount: content.downloadCount || 0,
    linkTemplate: content.linkTemplate,
    linkDownload: content.linkDonwload || content.linkDownload, // Typo in schema: linkDonwload
    category: category
      ? {
          id: category.id,
          name: category.name,
          parentId: category.parentId,
        }
      : null,
  };
}

export default async function ContentPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await auth();

  // 1. Try Templates
  try {
    const templateRaw = await db
      .select()
      .from(contentTemplates)
      .leftJoin(
        categoryTemplates,
        eq(contentTemplates.categoryTemplatesId, categoryTemplates.id),
      )
      .where(eq(contentTemplates.id, params.id))
      .limit(1);

    if (templateRaw.length) {
      return await renderPage(templateRaw[0], 'template', user);
    }
  } catch (e) {
    console.error('Error fetching template:', e);
  }

  // 2. Try Components
  try {
    const componentRaw = await db
      .select()
      .from(contentComponents)
      .leftJoin(
        categoryComponents,
        eq(contentComponents.categoryComponentsId, categoryComponents.id),
      )
      .where(eq(contentComponents.id, params.id))
      .limit(1);

    if (componentRaw.length) {
      return await renderPage(componentRaw[0], 'component', user);
    }
  } catch (e) {
    console.error('Error fetching component:', e);
  }

  // 3. Try Designs
  try {
    const designRaw = await db
      .select()
      .from(contentDesigns)
      .leftJoin(
        categoryDesigns,
        eq(contentDesigns.categoryDesignsId, categoryDesigns.id),
      )
      .where(eq(contentDesigns.id, params.id))
      .limit(1);

    if (designRaw.length) {
      return await renderPage(designRaw[0], 'design', user);
    }
  } catch (e) {
    console.error('Error fetching design:', e);
  }

  // 4. Try Gradients
  try {
    const gradientRaw = await db
      .select()
      .from(contentGradients)
      .leftJoin(
        categoryGradients,
        eq(contentGradients.categoryGradientsId, categoryGradients.id),
      )
      .where(eq(contentGradients.id, params.id))
      .limit(1);

    if (gradientRaw.length) {
      return await renderPage(gradientRaw[0], 'gradient', user);
    }
  } catch (e) {
    console.error('Error fetching gradient:', e);
  }

  return notFound();
}

async function renderPage(
  currentItemRaw: any,
  type: UnifiedContent['type'],
  user: any,
) {
  const content = normalizeContent(currentItemRaw, type);

  // Determine Table & Column for Previous/Next logic
  let dbTable: any = contentTemplates;
  let categoryIdField: any = contentTemplates.categoryTemplatesId;

  if (type === 'component') {
    dbTable = contentComponents;
    categoryIdField = contentComponents.categoryComponentsId;
  } else if (type === 'design') {
    dbTable = contentDesigns;
    categoryIdField = contentDesigns.categoryDesignsId;
  } else if (type === 'gradient') {
    dbTable = contentGradients;
    categoryIdField = contentGradients.categoryGradientsId;
  }

  const categoryTable = getCategoryTable(type);

  // 1. PREV ITEM (Fetch full object + Join Category)
  const prevItemRaw = await db
    .select()
    .from(dbTable)
    .leftJoin(categoryTable, eq(categoryIdField, categoryTable.id))
    .where(
      and(
        lt(dbTable.number, content.number),
        eq(categoryIdField, content.category?.id || ''),
      ),
    )
    .orderBy(desc(dbTable.number)) // Get the immediate previous number (e.g., 4 if current is 5)
    .limit(1);

  const prevItem = prevItemRaw.length
    ? normalizeContent(prevItemRaw[0], type)
    : null;

  // 2. NEXT ITEM (Fetch full object + Join Category)
  const nextItemRaw = await db
    .select()
    .from(dbTable)
    .leftJoin(categoryTable, eq(categoryIdField, categoryTable.id))
    .where(
      and(
        gt(dbTable.number, content.number),
        eq(categoryIdField, content.category?.id || ''),
      ),
    )
    // FIX: Changed to 'asc' so we get the immediate next number (e.g. 6 if current is 5), not the last one
    .orderBy(asc(dbTable.number))
    .limit(1);

  const nextItem = nextItemRaw.length
    ? normalizeContent(nextItemRaw[0], type)
    : null;

  // 3. RELEVANT ITEMS
  const relevantItemsRaw = await db
    .select()
    .from(dbTable)
    .leftJoin(categoryTable, eq(categoryIdField, categoryTable.id))
    .where(
      and(
        eq(categoryIdField, content.category?.id || ''),
        ne(dbTable.id, content.id),
      ),
    )
    .limit(3);

  const relevantContent = relevantItemsRaw.map((item) =>
    normalizeContent(item, type),
  );

  // 4. POPULAR ITEMS
  const popularItemsRaw = await db
    .select()
    .from(dbTable)
    .leftJoin(categoryTable, eq(categoryIdField, categoryTable.id))
    .orderBy(desc(dbTable.downloadCount))
    .limit(3);

  const popularContent = popularItemsRaw.map((item) =>
    normalizeContent(item, type),
  );

  return (
    <ContentDetailClient
      content={content}
      // UPDATE: Pass the full objects, not just IDs
      prevItem={prevItem}
      nextItem={nextItem}
      relevantContent={relevantContent}
      popularContent={popularContent}
      userTier={user?.user.tier === 'pro_plus' ? 'pro_plus' : 'free'}
    />
  );
}

function getCategoryTable(type: UnifiedContent['type']) {
  switch (type) {
    case 'component':
      return categoryComponents;
    case 'design':
      return categoryDesigns;
    case 'gradient':
      return categoryGradients;
    default:
      return categoryTemplates;
  }
}
