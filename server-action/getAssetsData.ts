'use server';

import { db } from '@/libs/drizzle';
import { eq, desc, count } from 'drizzle-orm';
import {
  contentComponents,
  contentTemplates,
  contentGradients,
  contentDesigns,
} from '@/db/migration';
import { NavCategoryItem } from '@/types/category';

// Helper to calculate counts recursively
function buildCategoryTree(
  categories: any[],
  countsMap: Map<string, number>,
): NavCategoryItem[] {
  const map = new Map<string, NavCategoryItem>();
  const roots: NavCategoryItem[] = [];

  // 1. Create Nodes
  categories.forEach((c) => {
    // Get direct item count for this category
    const directCount = countsMap.get(c.id) || 0;

    map.set(c.id, {
      id: c.id,
      name: c.name,
      slug: c.name,
      count: directCount, // Initialize with direct count
      children: [],
    });
  });

  // 2. Link Parent-Child
  categories.forEach((c) => {
    const node = map.get(c.id);
    if (!node) return;

    if (c.parentId) {
      const parent = map.get(c.parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // 3. Aggregate Counts (Post-Order Traversal / Bottom-Up)
  // We need to sum up children's counts into the parent
  const aggregateCounts = (node: NavCategoryItem): number => {
    let total = node.count || 0;
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        total += aggregateCounts(child);
      });
    }
    // Update the node's count to include its children
    // node.count = total;
    // OPTIONAL: If we want the parent chip to show ALL items in its subtree.
    // Usually yes for filters.
    node.count = total;
    return total;
  };

  roots.forEach((root) => aggregateCounts(root));

  return roots;
}

export async function getAssetsData() {
  try {
    // 1. Parallel Fetching of Data
    const results = await Promise.allSettled([
      // Categories
      db.query.categoryComponents.findMany(),
      db.query.categoryTemplates.findMany(),
      db.query.categoryGradients.findMany(),
      db.query.categoryDesigns.findMany(),

      // Content Items (Full list for UI)
      db.query.contentComponents.findMany({
        where: eq(contentComponents.statusContent, 'published'),
        with: { category: true, user: true },
        orderBy: [desc(contentComponents.createdAt)],
      }),
      db.query.contentTemplates.findMany({
        where: eq(contentTemplates.statusContent, 'published'),
        with: { category: true, user: true },
        orderBy: [desc(contentTemplates.createdAt)],
      }),
      db.query.contentGradients.findMany({
        with: { category: true, user: true },
        orderBy: [desc(contentGradients.createdAt)],
      }),
      db.query.contentDesigns.findMany({
        where: eq(contentDesigns.statusContent, 'published'),
        with: { category: true, user: true },
        orderBy: [desc(contentDesigns.createdAt)],
      }),

      // Counts Aggregation (Group By Category)
      db
        .select({ id: contentComponents.categoryComponentsId, value: count() })
        .from(contentComponents)
        .where(eq(contentComponents.statusContent, 'published'))
        .groupBy(contentComponents.categoryComponentsId),

      db
        .select({ id: contentTemplates.categoryTemplatesId, value: count() })
        .from(contentTemplates)
        .where(eq(contentTemplates.statusContent, 'published'))
        .groupBy(contentTemplates.categoryTemplatesId),

      db
        .select({ id: contentGradients.categoryGradientsId, value: count() })
        .from(contentGradients)
        .groupBy(contentGradients.categoryGradientsId),

      db
        .select({ id: contentDesigns.categoryDesignsId, value: count() })
        .from(contentDesigns)
        .where(eq(contentDesigns.statusContent, 'published'))
        .groupBy(contentDesigns.categoryDesignsId),
    ]);

    // Helper
    const getResult = <T>(result: PromiseSettledResult<T[]>): T[] => {
      if (result.status === 'fulfilled') return result.value;
      console.error('Query failed:', result.reason);
      return [];
    };

    // Unpack Data
    const catComponents = getResult(results[0]);
    const catTemplates = getResult(results[1]);
    const catGradients = getResult(results[2]);
    const catDesigns = getResult(results[3]);

    const itemsComponents = getResult(results[4]);
    const itemsTemplates = getResult(results[5]);
    const itemsGradients = getResult(results[6]);
    const itemsDesigns = getResult(results[7]);

    const countsComponents = getResult(results[8]);
    const countsTemplates = getResult(results[9]);
    const countsGradients = getResult(results[10]);
    const countsDesigns = getResult(results[11]);

    // Build Maps for Counts
    const mapCounts = (list: { id: string | null; value: number }[]) => {
      const m = new Map<string, number>();
      list.forEach((item) => {
        if (item.id) m.set(item.id, item.value);
      });
      return m;
    };

    const mapComp = mapCounts(countsComponents);
    const mapTemp = mapCounts(countsTemplates);
    const mapGrad = mapCounts(countsGradients);
    const mapDes = mapCounts(countsDesigns);

    // Build Trees with Counts
    const componentCategories = buildCategoryTree(catComponents, mapComp);
    const templateCategories = buildCategoryTree(catTemplates, mapTemp);
    const gradientCategories = buildCategoryTree(catGradients, mapGrad);
    const designCategories = buildCategoryTree(catDesigns, mapDes);

    // Map Items (Same as before)
    const allItems: any[] = [];

    // Components
    itemsComponents.forEach((item: any) => {
      allItems.push({
        id: item.id,
        title: item.title,
        type: 'components',
        categorySlug: item.category?.name || 'Uncategorized',
        tier: item.tier,
        imageUrl: item.imageUrl,
        slug: item.slug?.current,
        createdAt: item.createdAt,
        platform: item.platform,
        author: item.user?.name || 'MoonUI Team',
        copyData: item.copyComponentTextHTML,
        typeContent: item.typeContent,
      });
    });

    // Templates
    itemsTemplates.forEach((item: any) => {
      allItems.push({
        id: item.id,
        title: item.title,
        type: 'templates',
        categorySlug: item.category?.name || 'Uncategorized',
        tier: item.tier,
        imageUrl: item.urlPreview || item.imageUrl || '',
        slug: item.slug?.current,
        platform: item.platform,
        createdAt: item.createdAt,
        author: item.user?.name || 'MoonUI Team',
        downloadUrl: item.linkDonwload,
        size: item.size,
        format: item.format,
        typeContent: item.typeContent,
      });
    });

    // Gradients
    itemsGradients.forEach((item: any) => {
      allItems.push({
        id: item.id,
        title: item.name,
        type: 'gradients',
        categorySlug: item.category?.name || 'Uncategorized',
        gradientType: item.typeGradient,
        tier: item.tier,
        colors: item.colors,
        slug: item.slug?.current,
        createdAt: item.createdAt,
        author: item.user?.name || 'MoonUI Team',
        downloadUrl: item.linkDownload,
        size: item.size,
        format: item.format,
      });
    });

    // Designs
    itemsDesigns.forEach((item: any) => {
      allItems.push({
        id: item.id,
        title: item.title,
        type: 'designs',
        categorySlug: item.category?.name || 'Uncategorized',
        tier: item.tier,
        imageUrl: item.imageUrl,
        slug: item.slug?.current,
        createdAt: item.createdAt,
        author: item.user?.name || 'MoonUI Team',
        downloadUrl: item.linkDownload,
        size: item.size,
        format: item.format,
      });
    });

    return {
      allItems,
      componentCategories,
      templateCategories,
      gradientCategories,
      designCategories,
    };
  } catch (error) {
    console.error('Fatal Error fetching assets data:', error);
    return {
      allItems: [],
      componentCategories: [],
      templateCategories: [],
      gradientCategories: [],
      designCategories: [],
    };
  }
}
