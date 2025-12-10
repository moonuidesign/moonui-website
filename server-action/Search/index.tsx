'use server';

import { db } from '@/libs/drizzle';
import { eq, and, ilike, desc } from 'drizzle-orm';
import {
  contentComponents,
  contentDesigns,
  contentGradients,
  contentTemplates,
} from '@/db/migration/schema';

export type SearchResultItem = {
  id: string;
  title: string;
  type: 'Component' | 'Template' | 'Gradient' | 'Design';
  tier: 'free' | 'pro' | 'pro_plus';
  category: string;
  subcategory: string | null;
  url: string;
  description?: string | null;
  number?: number | null;
};

export async function getGlobalSearchData(query?: string) {
  const results: SearchResultItem[] = [];
  const searchQuery = query ? `%${query}%` : undefined;

  console.log('[GlobalSearch] Starting search with query:', query);

  try {
    // 1. FETCH COMPONENTS
    console.log('[GlobalSearch] Fetching Components...');
    const components = await db.query.contentComponents.findMany({
      where: and(
        eq(contentComponents.statusContent, 'published'),
        searchQuery ? ilike(contentComponents.title, searchQuery) : undefined,
      ),
      with: {
        category: {
          with: { parent: true },
        },
      },
      limit: searchQuery ? 10 : 20,
      orderBy: [desc(contentComponents.createdAt)],
    });
    console.log(`[GlobalSearch] Found ${components.length} components`);

    components.forEach((item) => {
      const mainCategory =
        item.category?.parent?.name || item.category?.name || 'Uncategorized';
      const subCategory = item.category?.parent ? item.category?.name : null;

      results.push({
        id: item.id,
        title: item.title,
        type: 'Component',
        tier: item.tier as 'free' | 'pro',
        number: item.number,
        category: mainCategory,
        subcategory: subCategory,
        url: `/assets/components/${item.slug.current}`,
      });
    });

    // 2. FETCH TEMPLATES
    console.log('[GlobalSearch] Fetching Templates...');
    const templates = await db.query.contentTemplates.findMany({
      where: and(
        eq(contentTemplates.statusContent, 'published'),
        searchQuery ? ilike(contentTemplates.title, searchQuery) : undefined,
      ),
      with: { category: { with: { parent: true } } },
      limit: searchQuery ? 10 : 20,
      orderBy: [desc(contentTemplates.createdAt)],
    });
    console.log(`[GlobalSearch] Found ${templates.length} templates`);

    templates.forEach((item) => {
      const mainCategory =
        item.category?.parent?.name || item.category?.name || 'Uncategorized';
      const subCategory = item.category?.parent ? item.category?.name : null;

      results.push({
        id: item.id,
        title: item.title,
        type: 'Template',
        tier: item.tier as 'free' | 'pro_plus',
        number: item.number,
        category: mainCategory,
        subcategory: subCategory,
        url: `/assets/templates/${item.slug.current}`,
      });
    });

    // 3. FETCH GRADIENTS
    console.log('[GlobalSearch] Fetching Gradients...');
    const gradients = await db.query.contentGradients.findMany({
      where: searchQuery ? ilike(contentGradients.name, searchQuery) : undefined,
      with: { category: { with: { parent: true } } },
      limit: searchQuery ? 10 : 20,
      orderBy: [desc(contentGradients.createdAt)],
    });
    console.log(`[GlobalSearch] Found ${gradients.length} gradients`);

    gradients.forEach((item) => {
      results.push({
        id: item.id,
        title: item.name,
        type: 'Gradient',
        tier: item.tier as 'free' | 'pro',
        number: item.number,
        category: 'Colors',
        subcategory: item.typeGradient,
        url: `/assets/gradients/${item.slug.current}`,
      });
    });

    // 4. FETCH DESIGNS
    console.log('[GlobalSearch] Fetching Designs...');
    const designs = await db.query.contentDesigns.findMany({
      where: and(
        eq(contentDesigns.statusContent, 'published'),
        searchQuery ? ilike(contentDesigns.title, searchQuery) : undefined,
      ),
      with: { category: { with: { parent: true } } },
      limit: searchQuery ? 10 : 20,
      orderBy: [desc(contentDesigns.createdAt)],
    });
    console.log(`[GlobalSearch] Found ${designs.length} designs`);

    designs.forEach((item) => {
      const mainCategory =
        item.category?.parent?.name || item.category?.name || 'Uncategorized';
      const subCategory = item.category?.parent ? item.category?.name : null;

      results.push({
        id: item.id,
        title: item.title,
        type: 'Design',
        tier: item.tier as 'free' | 'pro_plus',
        number: item.number,
        category: mainCategory,
        subcategory: subCategory,
        url: `/assets/designs/${item.slug.current}`,
      });
    });
  } catch (error) {
    console.error('[GlobalSearch] Error fetching global search data:', error);
    // You might want to rethrow or handle this specifically depending on your UI needs
    // throw error; 
  }

  console.log(`[GlobalSearch] Returning total ${results.length} results`);
  return results;
}
