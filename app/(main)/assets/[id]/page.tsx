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
} from '@/db/migration/schema';
import { auth } from '@/libs/auth';
import { db } from '@/libs/drizzle';
import { UnifiedContent } from '@/types/assets';
import { and, desc, eq, gt, lt, ne } from 'drizzle-orm';

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

  // Helper for Prev/Next/Related queries to avoid repetition?
  // Since db.query[table] is type-safe, generic abstraction is tricky without `any`.
  // We'll just do a simpler approach or direct query.
  // Using direct query for flexibility across tables.

  // NOTE: drizzle-orm functions need specific columns.
  // We'll use `db.select` instead of `db.query` for generic dynamic table usage or switch.

  // Actually, let's keep it simple. We mostly need 'number' for ordering.

  // PREV ITEM
  const prevItemRaw = await db
    .select({ id: dbTable.id })
    .from(dbTable)
    .where(
      and(
        lt(dbTable.number, content.number),
        eq(categoryIdField, content.category?.id || ''),
      ),
    )
    .orderBy(desc(dbTable.number))
    .limit(1);

  const prevId = prevItemRaw[0]?.id;

  // NEXT ITEM
  const nextItemRaw = await db
    .select({ id: dbTable.id })
    .from(dbTable)
    .where(
      and(
        gt(dbTable.number, content.number),
        eq(categoryIdField, content.category?.id || ''),
      ),
    )
    .orderBy(desc(dbTable.number)) // Wait, next item (greater number) should probably be ordered ASC if we want the *immediate* next?
    // User logic was: gt(number, cur) -> orderBy desc(number). This finds the LARGEST number that is greater than current.
    // Usually "Next" means "Number + 1". So if Current is 5. We want 6.
    // gt(5) -> 6, 7, 8.
    // orderBy desc -> 8.
    // So "Next" gives the newest item? That's valid for "Newer Post".
    // I will stick to original logic: orderBy(desc).
    .limit(1);

  const nextId = nextItemRaw[0]?.id;

  // RELEVANT ITEMS
  // We need to join with category table to be consistent with existing logic?
  // Existing logic: leftJoin category.
  // We can just query the content table if we have the category ID.
  const relevantItemsRaw = await db
    .select() // Select all fields to normalize
    .from(dbTable)
    .leftJoin(
      getCategoryTable(type),
      eq(categoryIdField, getCategoryTable(type).id),
    )
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

  // POPULAR ITEMS
  const popularItemsRaw = await db
    .select()
    .from(dbTable)
    .leftJoin(
      getCategoryTable(type),
      eq(categoryIdField, getCategoryTable(type).id),
    )
    .orderBy(desc(dbTable.downloadCount))
    .limit(3);

  const popularContent = popularItemsRaw.map((item) =>
    normalizeContent(item, type),
  );

  return (
    <ContentDetailClient
      content={content}
      prevId={prevId}
      nextId={nextId}
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
