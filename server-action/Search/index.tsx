'use server';

import { db } from '@/libs/drizzle';
import { eq, and, ilike, desc, or, sql, isNull, isNotNull } from 'drizzle-orm';
import {
  contentComponents,
  contentDesigns,
  contentGradients,
  contentTemplates,
  categoryComponents,
  categoryTemplates,
  categoryGradients,
  categoryDesigns,
  users,
} from '@/db/migration';

export type SearchResultItem = {
  id: string;
  title: string;
  type:
    | 'Component'
    | 'Template'
    | 'Gradient'
    | 'Design'
    | 'Category'
    | 'SubCategory';
  tier?: 'free' | 'pro' | 'pro_plus';
  category?: string;
  subcategory?: string | null;
  url: string;
  description?: string | null;
  number?: number | null;
  contentType?: 'components' | 'templates' | 'gradients' | 'designs'; // For categories
  slug?: string;
  parentSlug?: string; // For subcategories
};

export type GlobalSearchResponse = {
  templates: SearchResultItem[];
  templateCategories: SearchResultItem[];
  templateSubCategories: SearchResultItem[];
  components: SearchResultItem[];
  componentCategories: SearchResultItem[];
  componentSubCategories: SearchResultItem[];
  designs: SearchResultItem[];
  designCategories: SearchResultItem[];
  designSubCategories: SearchResultItem[];
  gradients: SearchResultItem[];
  gradientCategories: SearchResultItem[];
  gradientSubCategories: SearchResultItem[];
};

export async function getGlobalSearchData(
  query?: string,
): Promise<GlobalSearchResponse> {
  const searchQuery = query ? `%${query}%` : undefined;

  // Helper to fetch content items
  const fetchItems = async (
    table: any,
    catTable: any,
    type: 'Component' | 'Template' | 'Gradient' | 'Design',
    limit: number,
    urlPrefix: string,
  ) => {
    // 1. Identify columns safely
    const titleCol = 'title' in table ? table.title : table.name;
    const statusCol = 'statusContent' in table ? table.statusContent : undefined;
    const slugCol = 'slug' in table ? table.slug : undefined;
    
    // 2. Build Where Clause
    const conditions = [];

    // Status Check (only if column exists)
    if (statusCol) {
      conditions.push(eq(statusCol, 'published'));
    }

    // Search Query
    if (searchQuery) {
      const orConditions = [
        ilike(titleCol, searchQuery), // Title/Name
        ilike(users.name, searchQuery), // Author
        ilike(catTable.name, searchQuery), // Category Name
      ];

      // Slug Search (only if JSONB slug exists)
      if (slugCol) {
        orConditions.push(sql`${slugCol}->>'current' ILIKE ${searchQuery}`);
      }

      conditions.push(or(...orConditions));
    }

    const q = db
      .select({
        item: table,
        category: catTable,
        user: users,
      })
      .from(table)
      .leftJoin(
        catTable,
        eq(table[`category${type}sId` as keyof typeof table], catTable.id),
      )
      .leftJoin(users, eq(table.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(table.createdAt))
      .limit(limit);

    const res = await q;
    
    return res.map(({ item, category }: any) => ({
      id: item.id,
      title: item.title || item.name,
      type,
      tier: item.tier as any,
      number: item.number,
      category: category?.name || 'Uncategorized',
      url: `/assets/${urlPrefix}/${(item.slug as any)?.current}`,
      contentType: urlPrefix as any,
    }));
  };

  // Helper to fetch categories (Main or Sub)
  const fetchCats = async (
    table: any,
    contentType: 'components' | 'templates' | 'gradients' | 'designs',
    isSub: boolean,
    limit: number,
  ) => {
    // If we need subcategories, we join to get parent name?
    // For now simple fetch.
    // If isSub is true, parentId should be NOT NULL. If false, parentId should be NULL.

    let whereClause = undefined;

    if (searchQuery) {
      whereClause = ilike(table.name, searchQuery);
    } else {
      // Only apply strict parent/child logic if no search query,
      // OR apply it always? Usually search should find any category.
      // But the prompt implies distinct sections.
      // Let's apply strict structure:
      // Main Category: parentId IS NULL
      // Sub Category: parentId IS NOT NULL
      if (isSub) {
        whereClause = isNotNull(table.parentId);
      } else {
        whereClause = isNull(table.parentId);
      }
    }

    // If there is a search query, we should probably still respect the hierarchy
    // OR just return matches.
    // Let's respect hierarchy to keep them in their correct UI buckets.
    const hierarchyClause = isSub
      ? isNotNull(table.parentId)
      : isNull(table.parentId);

    const finalWhere = searchQuery
      ? and(ilike(table.name, searchQuery), hierarchyClause)
      : hierarchyClause;

    // We might need to join to get parent slug for subcategories if we want to filter correctly later
    // but the schema says parentId references id.

    const q = db.select().from(table).where(finalWhere).limit(limit);

    // For subcategories, we might want to know the parent slug.
    // Let's do a join if it is sub
    if (isSub) {
      // This is a self-join scenario, might be complex with simple select.
      // Let's just fetch for now, we can resolve parent slug if needed or just use ID.
      // But for filtering we usually need slugs.
      // Let's assume for now we use the subcategory's own slug/name.
    }

    const res = await q;
    return res.map((c: any) => ({
      id: c.id,
      title: c.name,
      type: isSub ? 'SubCategory' : 'Category',
      contentType,
      slug: c.name, // Using name as slug based on previous context
      url: `/assets?type=${contentType}&category=${c.name}`,
    }));
  };

  try {
    const [
      templates,
      templateCategories,
      templateSubCategories,
      components,
      componentCategories,
      componentSubCategories,
      designs,
      designCategories,
      designSubCategories,
      gradients,
      gradientCategories,
      gradientSubCategories,
    ] = await Promise.all([
      // Templates (3 items)
      fetchItems(
        contentTemplates,
        categoryTemplates,
        'Template',
        3,
        'templates',
      ),
      // Template Cats (5)
      fetchCats(categoryTemplates, 'templates', false, 5),
      // Template SubCats (5)
      fetchCats(categoryTemplates, 'templates', true, 5),

      // Components (3 items)
      fetchItems(
        contentComponents,
        categoryComponents,
        'Component',
        3,
        'components',
      ),
      // Component Cats (5)
      fetchCats(categoryComponents, 'components', false, 5),
      // Component SubCats (5)
      fetchCats(categoryComponents, 'components', true, 5),

      // Designs (3 items)
      fetchItems(contentDesigns, categoryDesigns, 'Design', 3, 'designs'),
      // Design Cats (5)
      fetchCats(categoryDesigns, 'designs', false, 5),
      // Design SubCats (5)
      fetchCats(categoryDesigns, 'designs', true, 5),

      // Gradients (5 items - per prompt)
      fetchItems(
        contentGradients,
        categoryGradients,
        'Gradient',
        5,
        'gradients',
      ),
      // Gradient Cats (5)
      fetchCats(categoryGradients, 'gradients', false, 5),
      // Gradient SubCats (5)
      fetchCats(categoryGradients, 'gradients', true, 5),
    ]);

    // For subcategories, we ideally need the parent slug to filter correctly.
    // However, the current simple fetch doesn't get it.
    // If the frontend logic for "more" subcategory requires "parent category + sub category",
    // we might need to update this to fetch parent info.
    // Given the constraints and current schema (parentId), I'll stick to basic fetch.
    // The "slug" property is currently just the name.

    return {
      templates,
      templateCategories,
      templateSubCategories,
      components,
      componentCategories,
      componentSubCategories,
      designs,
      designCategories,
      designSubCategories,
      gradients,
      gradientCategories,
      gradientSubCategories,
    };
  } catch (error) {
    console.error('[GlobalSearch] Error:', error);
    return {
      templates: [],
      templateCategories: [],
      templateSubCategories: [],
      components: [],
      componentCategories: [],
      componentSubCategories: [],
      designs: [],
      designCategories: [],
      designSubCategories: [],
      gradients: [],
      gradientCategories: [],
      gradientSubCategories: [],
    };
  }
}
