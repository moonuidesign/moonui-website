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
  contentType?: 'components' | 'templates' | 'gradients' | 'designs';
  slug?: string;
  parentSlug?: string;
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
  ): Promise<SearchResultItem[]> => {
    // 1. Identify columns safely
    const titleCol = 'title' in table ? table.title : table.name;
    const statusCol =
      'statusContent' in table ? table.statusContent : undefined;
    const slugCol = 'slug' in table ? table.slug : undefined;
    const formatCol = 'format' in table ? table.format : undefined;
    const typeContentCol =
      'typeContent' in table ? table.typeContent : undefined;

    // 2. Build Where Clause
    const conditions = [];

    if (statusCol) {
      conditions.push(eq(statusCol, 'published'));
    }

    if (searchQuery) {
      const orConditions = [
        ilike(titleCol, searchQuery),
        ilike(users.name, searchQuery),
        ilike(catTable.name, searchQuery),
        sql`CAST(${table.number} AS TEXT) ILIKE ${searchQuery}`,
      ];

      if (slugCol) {
        // Handle JSONB slugs (all content tables use JSONB slug with 'current' key)
        orConditions.push(sql`${slugCol}->>'current' ILIKE ${searchQuery}`);
        orConditions.push(sql`CAST(${slugCol} AS TEXT) ILIKE ${searchQuery}`);
      }

      if (formatCol) {
        orConditions.push(ilike(formatCol, searchQuery));
      }

      if (typeContentCol) {
        orConditions.push(ilike(typeContentCol, searchQuery));
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

    // Explicitly return SearchResultItem[]
    return res.map(
      ({ item, category }: any): SearchResultItem => ({
        id: item.id,
        title: item.title || item.name,
        type: type, // 'type' is strictly typed from argument
        tier: item.tier as any,
        number: item.number,
        category: category?.name || 'Uncategorized',
        url: `/assets/${item.id}`,
        contentType: urlPrefix as any,
      }),
    );
  };

  // Helper to fetch categories (Main or Sub)
  const fetchCats = async (
    table: any,
    contentType: 'components' | 'templates' | 'gradients' | 'designs',
    isSub: boolean,
    limit: number,
  ): Promise<SearchResultItem[]> => {
    let whereClause = undefined;

    // Determine conditions based on search query and hierarchy
    if (searchQuery) {
      // If searching, check name AND verify hierarchy
      const hierarchyClause = isSub
        ? isNotNull(table.parentId)
        : isNull(table.parentId);
      whereClause = and(ilike(table.name, searchQuery), hierarchyClause);
    } else {
      // If not searching, just strict hierarchy
      whereClause = isSub ? isNotNull(table.parentId) : isNull(table.parentId);
    }

    const q = db.select().from(table).where(whereClause).limit(limit);

    const res = await q;

    // PERBAIKAN UTAMA ADA DI SINI:
    // 1. Menambahkan return type : SearchResultItem pada map
    // 2. Menggunakan 'as const' atau casting pada properti 'type'
    return res.map(
      (c: any): SearchResultItem => ({
        id: c.id,
        title: c.name,
        // TypeScript akan menganggap ini 'string' jika tidak di-cast
        type: isSub ? ('SubCategory' as const) : ('Category' as const),
        contentType,
        slug: c.name,
        url: `/assets?type=${contentType}&category=${c.name}`,
      }),
    );
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
      // Templates
      fetchItems(
        contentTemplates,
        categoryTemplates,
        'Template',
        100,
        'templates',
      ),
      fetchCats(categoryTemplates, 'templates', false, 20),
      fetchCats(categoryTemplates, 'templates', true, 20),

      // Components
      fetchItems(
        contentComponents,
        categoryComponents,
        'Component',
        100,
        'components',
      ),
      fetchCats(categoryComponents, 'components', false, 20),
      fetchCats(categoryComponents, 'components', true, 20),

      // Designs
      fetchItems(contentDesigns, categoryDesigns, 'Design', 100, 'designs'),
      fetchCats(categoryDesigns, 'designs', false, 20),
      fetchCats(categoryDesigns, 'designs', true, 20),

      // Gradients
      fetchItems(
        contentGradients,
        categoryGradients,
        'Gradient',
        100,
        'gradients',
      ),
      fetchCats(categoryGradients, 'gradients', false, 20),
      fetchCats(categoryGradients, 'gradients', true, 20),
    ]);

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
