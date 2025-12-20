'use server';

import { db } from '@/libs/drizzle';
import { eq, count } from 'drizzle-orm';
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
    const directCount = countsMap.get(c.id) || 0;

    map.set(c.id, {
      id: c.id,
      name: c.name,
      slug: c.name,
      count: directCount, // Initialize with direct count
      children: [],
    });
  });
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

  const aggregateCounts = (node: NavCategoryItem): number => {
    let total = node.count || 0;
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        total += aggregateCounts(child);
      });
    }

    node.count = total;
    return total;
  };

  roots.forEach((root) => aggregateCounts(root));

  return roots;
}

import { getAssetsItems } from './getAssetsItems';

export async function getAssetsData(filters?: {
  contentType?: string;
  tool?: string;
  searchQuery?: string;
}) {
  try {
    const { contentType = 'components', tool = 'figma', searchQuery = '' } = filters || {};
    // 1. Parallel Fetching of Data
    const results = await Promise.allSettled([
      // Categories
      db.query.categoryComponents.findMany(),
      db.query.categoryTemplates.findMany(),
      db.query.categoryGradients.findMany(),
      db.query.categoryDesigns.findMany(),

      // Counts Aggregation (Group By Category & Tool)
      db
        .select({
          id: contentComponents.categoryComponentsId,
          type: contentComponents.typeContent,
          value: count(),
        })
        .from(contentComponents)
        .where(eq(contentComponents.statusContent, 'published'))
        .groupBy(
          contentComponents.categoryComponentsId,
          contentComponents.typeContent,
        ),

      db
        .select({
          id: contentTemplates.categoryTemplatesId,
          type: contentTemplates.typeContent,
          value: count(),
        })
        .from(contentTemplates)
        .where(eq(contentTemplates.statusContent, 'published'))
        .groupBy(
          contentTemplates.categoryTemplatesId,
          contentTemplates.typeContent,
        ),

      db
        .select({ id: contentGradients.categoryGradientsId, value: count() })
        .from(contentGradients)
        .groupBy(contentGradients.categoryGradientsId),

      db
        .select({
          id: contentDesigns.categoryDesignsId,
          type: contentDesigns.format,
          value: count(),
        })
        .from(contentDesigns)
        .where(eq(contentDesigns.statusContent, 'published'))
        .groupBy(contentDesigns.categoryDesignsId, contentDesigns.format),
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

    const countsComponents = getResult(results[4]);
    const countsTemplates = getResult(results[5]);
    const countsGradients = getResult(results[6]);
    const countsDesigns = getResult(results[7]);

    // Build Maps for Counts (Tool Aware)
    const mapCountsTool = (
      list: { id: string | null; type?: string | null; value: number }[],
    ) => {
      const all = new Map<string, number>();
      const figma = new Map<string, number>();
      const framer = new Map<string, number>();

      list.forEach((item) => {
        if (!item.id) return;
        // Aggregate All
        all.set(item.id, (all.get(item.id) || 0) + item.value);

        // Split by Tool
        const t = item.type?.toLowerCase();
        if (t === 'figma') {
          figma.set(item.id, (figma.get(item.id) || 0) + item.value);
        } else if (t === 'framer' || t === 'react') {
          framer.set(item.id, (framer.get(item.id) || 0) + item.value);
        }
      });
      return { all, figma, framer };
    };

    // Simple Map for non-tool items
    const mapCountsSimple = (list: { id: string | null; value: number }[]) => {
      const m = new Map<string, number>();
      list.forEach((item) => {
        if (item.id) m.set(item.id, item.value);
      });
      return m;
    };

    const mapsComp = mapCountsTool(countsComponents);
    const mapsTemp = mapCountsTool(countsTemplates);
    const mapGrad = mapCountsSimple(countsGradients);
    const mapsDes = mapCountsTool(countsDesigns); // Use Tool Aware for Designs

    // Build Trees with Counts
    const componentCategories = {
      all: buildCategoryTree(catComponents, mapsComp.all),
      figma: buildCategoryTree(catComponents, mapsComp.figma),
      framer: buildCategoryTree(catComponents, mapsComp.framer),
    };

    const templateCategories = {
      all: buildCategoryTree(catTemplates, mapsTemp.all),
      figma: buildCategoryTree(catTemplates, mapsTemp.figma),
      framer: buildCategoryTree(catTemplates, mapsTemp.framer),
    };

    // Gradients don't strictly have tools, but we provide structure for consistency
    const gradientCategoriesRaw = buildCategoryTree(catGradients, mapGrad);
    const gradientCategories = {
      all: gradientCategoriesRaw,
      figma: gradientCategoriesRaw, // Duplicate for now
      framer: gradientCategoriesRaw, // Duplicate for now
    };

    const designCategories = {
      all: buildCategoryTree(catDesigns, mapsDes.all),
      figma: buildCategoryTree(catDesigns, mapsDes.figma),
      framer: buildCategoryTree(catDesigns, mapsDes.framer),
    };

    // Fetch Initial Items (Page 1, Limit 12)
    const { items: allItems, totalCount } = await getAssetsItems(
      { contentType, tool, searchQuery },
      { page: 1, limit: 12 },
    );
    
    return {
      allItems,
      totalCount,
      componentCategories,
      templateCategories,
      gradientCategories,
      designCategories,
    };
  } catch (error) {
    console.error('Fatal Error fetching assets data:', error);

    return {
      allItems: [],
      totalCount: 0,
      componentCategories: { all: [], figma: [], framer: [] },
      templateCategories: { all: [], figma: [], framer: [] },
      gradientCategories: { all: [], figma: [], framer: [] },
      designCategories: { all: [], figma: [], framer: [] },
    };
  }
}
