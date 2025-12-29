'use server';

import { db } from '@/libs/drizzle';
import { and, eq, ilike, inArray, or, sql, SQL, gte } from 'drizzle-orm';
import {
  contentComponents,
  contentTemplates,
  contentGradients,
  contentDesigns,
  categoryComponents,
  categoryTemplates,
  categoryGradients,
  categoryDesigns,
} from '@/db/migration';

// --- Types ---
interface FilterParams {
  tool?: string | null;
  contentType?: string | null; // 'components', 'templates', 'gradients', 'designs'
  categorySlugs?: string[];
  subCategorySlugs?: string[]; // Ditambahkan ke interface agar valid
  selectedTiers?: string[];
  gradientTypes?: string[];
  selectedColors?: string[];
  searchQuery?: string;
  sortBy?: 'recent' | 'popular';
}

interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// --- Main Action ---
export async function getAssetsItems(
  filters: FilterParams,
  pagination: PaginationParams,
) {
  const page = pagination.page || 1;
  const limit = pagination.limit || 12;
  const offset = pagination.offset;

  // PERBAIKAN: Masukkan subCategorySlugs ke dalam destrukturisasi
  const {
    tool,
    contentType,
    categorySlugs = [],
    subCategorySlugs = [], // <-- Didefinisikan di sini agar tidak ReferenceError
    selectedTiers = [],
    gradientTypes = [],
    selectedColors = [],
    searchQuery = '',
    sortBy = 'recent',
  } = filters;

  console.log('Fetching items with sortBy:', sortBy);

  // 1. Define base tables and their mapping
  const sources = [
    {
      type: 'components',
      table: contentComponents,
      categoryTable: categoryComponents,
      catIdField: contentComponents.categoryComponentsId,
      statusField: contentComponents.statusContent,
      hasStatus: true,
      hasTool: true,
      hasColors: false,
      countField: contentComponents.copyCount,
    },
    {
      type: 'templates',
      table: contentTemplates,
      categoryTable: categoryTemplates,
      catIdField: contentTemplates.categoryTemplatesId,
      statusField: contentTemplates.statusContent,
      hasStatus: true,
      hasTool: true,
      hasColors: false,
      countField: contentTemplates.downloadCount,
    },
    {
      type: 'gradients',
      table: contentGradients,
      categoryTable: categoryGradients,
      catIdField: contentGradients.categoryGradientsId,
      statusField: null,
      hasStatus: false,
      hasTool: false,
      hasColors: true,
      countField: contentGradients.downloadCount,
    },
    {
      type: 'designs',
      table: contentDesigns,
      categoryTable: categoryDesigns,
      catIdField: contentDesigns.categoryDesignsId,
      statusField: contentDesigns.statusContent,
      hasStatus: true,
      hasTool: false,
      hasColors: false,
      countField: contentDesigns.downloadCount,
    },
  ];

  const activeSources = contentType
    ? sources.filter((s) => s.type === contentType)
    : sources;

  try {
    const promises = activeSources.map(async (source) => {
      const conditions: SQL[] = [];

      // Status Check
      if (source.hasStatus && source.statusField) {
        conditions.push(eq(source.statusField, 'published'));
      }

      // Tool Check
      if (tool && source.hasTool) {
        const table = source.table as any;
        if (tool === 'framer') {
          conditions.push(inArray(table.typeContent, ['framer', 'react']));
        } else {
          conditions.push(eq(table.typeContent, tool));
        }
      }

      // Tier Check
      if (selectedTiers.length > 0) {
        conditions.push(inArray((source.table as any).tier, selectedTiers));
      }

      // Gradient Type Check
      if (source.type === 'gradients' && gradientTypes.length > 0) {
        conditions.push(
          inArray((source.table as any).typeGradient, gradientTypes),
        );
      }

      // Search Query
      if (searchQuery) {
        const q = `%${searchQuery}%`;
        const table = source.table as any;

        // Define columns to search
        const titleCol = table.title || table.name;
        const numberCol = table.number;
        const slugCol = table.slug;

        const searchConditions: SQL[] = [
          ilike(titleCol, q),
          sql`CAST(${numberCol} AS TEXT) ILIKE ${q}`,
        ];

        // Handle JSONB slug or text slug
        if (slugCol) {
          searchConditions.push(sql`CAST(${slugCol} AS TEXT) ILIKE ${q}`);
          // Also try searching specifically in the 'current' key if it's JSONB
          searchConditions.push(sql`${slugCol}->>'current' ILIKE ${q}`);
        }

        conditions.push(or(...searchConditions) as SQL);
      }

      // Special "New" Filter
      if (categorySlugs.includes('new')) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        conditions.push(gte((source.table as any).createdAt, thirtyDaysAgo));
      }

      // Standard Category Filter
      const realCategorySlugs = categorySlugs.filter((s) => s !== 'new');
      const realSubCategorySlugs = subCategorySlugs; // Sekarang variabel ini sudah aman digunakan

      if (realCategorySlugs.length > 0 || realSubCategorySlugs.length > 0) {
        const allCategories = await db
          .select({
            id: source.categoryTable.id,
            name: source.categoryTable.name,
            parentId: (source.categoryTable as any).parentId,
          })
          .from(source.categoryTable);

        const selectedParentIds = allCategories
          .filter((c) => realCategorySlugs.includes(c.name))
          .map((c) => c.id);

        const selectedSubIds = allCategories
          .filter((c) => realSubCategorySlugs.includes(c.name))
          .map((c) => c.id);

        const finalIdsToInclude = new Set<string>();

        selectedSubIds.forEach((id) => finalIdsToInclude.add(id));

        selectedParentIds.forEach((parentId) => {
          const children = allCategories.filter(
            (c) => (c as any).parentId === parentId,
          );
          const childrenIds = children.map((c) => c.id);
          const hasSelectedChild = childrenIds.some((cid) =>
            selectedSubIds.includes(cid),
          );

          if (!hasSelectedChild) {
            finalIdsToInclude.add(parentId);
            childrenIds.forEach((cid) => finalIdsToInclude.add(cid));
          }
        });

        if (finalIdsToInclude.size > 0) {
          conditions.push(
            inArray(source.catIdField as any, Array.from(finalIdsToInclude)),
          );
        } else {
          conditions.push(sql`1 = 0`);
        }
      }

      // Colors Check
      if (source.type === 'gradients' && selectedColors.length > 0) {
        const colorConditions = selectedColors.map(
          (c) => sql`${(source.table as any).colors}::text ILIKE ${`%${c}%`}`,
        );
        conditions.push(or(...colorConditions) as SQL);
      }

      const query = db
        .select({
          id: source.table.id,
          createdAt: (source.table as any).createdAt,
          type: sql<string>`${source.type}`,
          count: sql<number>`COALESCE(${source.countField}, 0)`,
        })
        .from(source.table);

      if (conditions.length > 0) {
        query.where(and(...conditions));
      }

      return query;
    });

    const results = await Promise.all(promises);
    const allIds = results.flat();

    allIds.sort((a, b) => {
      if (sortBy === 'popular') {
        const countA = Number(a.count) || 0;
        const countB = Number(b.count) || 0;
        if (countA !== countB) return countB - countA;
      }
      // Fallback to recent if counts are equal or sortBy is recent
      const dateA = new Date(a.createdAt as any).getTime();
      const dateB = new Date(b.createdAt as any).getTime();
      return dateB - dateA;
    });

    const totalCount = allIds.length;
    const start = offset !== undefined ? offset : (page - 1) * limit;
    const sliced = allIds.slice(start, start + limit);

    if (sliced.length === 0) return { items: [], totalCount };

    const idsByType: Record<string, string[]> = {
      components: [],
      templates: [],
      gradients: [],
      designs: [],
    };
    sliced.forEach((item) => {
      if (idsByType[item.type]) idsByType[item.type].push(item.id);
    });

    const detailPromises = [];

    // Using relational queries for fetching details
    if (idsByType.components.length > 0) {
      detailPromises.push(
        db.query.contentComponents
          .findMany({
            where: inArray(contentComponents.id, idsByType.components),
            with: { category: true },
          })
          .then((res) => res.map((i) => ({ ...i, _type: 'components' }))),
      );
    }
    if (idsByType.templates.length > 0) {
      detailPromises.push(
        db.query.contentTemplates
          .findMany({
            where: inArray(contentTemplates.id, idsByType.templates),
            with: { category: true },
          })
          .then((res) => res.map((i) => ({ ...i, _type: 'templates' }))),
      );
    }
    if (idsByType.gradients.length > 0) {
      detailPromises.push(
        db.query.contentGradients
          .findMany({
            where: inArray(contentGradients.id, idsByType.gradients),
            with: { category: true },
          })
          .then((res) => res.map((i) => ({ ...i, _type: 'gradients' }))),
      );
    }
    if (idsByType.designs.length > 0) {
      detailPromises.push(
        db.query.contentDesigns
          .findMany({
            where: inArray(contentDesigns.id, idsByType.designs),
            with: { category: true },
          })
          .then((res) => res.map((i) => ({ ...i, _type: 'designs' }))),
      );
    }

    const detailResults = await Promise.all(detailPromises);
    const details = detailResults.flat();

    const normalizedItems = details.map((item: any) => {
      const type = item._type;
      let validImageUrl = item.imageUrl || item.image || '';
      if (!validImageUrl && item.imagesUrl) {
        validImageUrl = Array.isArray(item.imagesUrl)
          ? item.imagesUrl[0]
          : item.imagesUrl;
      }

      const common = {
        id: item.id,
        tier: item.tier,
        slug: typeof item.slug === 'string' ? item.slug : item.slug?.current,
        createdAt: item.createdAt,
        author: item.user?.name || 'MoonUI Team',
        categorySlug: item.category?.name || 'Uncategorized',
        type: type,
        count: item.copyCount || item.downloadCount || 0,
      };

      // Transformasi sesuai tipe
      const mappings: Record<string, any> = {
        components: {
          title: item.title,
          imageUrl: validImageUrl,

          copyData: item.copyComponentTextHTML,
          typeContent: item.typeContent,
        },
        templates: {
          title: item.title,
          imageUrl: validImageUrl,

          downloadUrl: item.linkDonwload,
          size: item.size,
          format: item.format,
          typeContent: item.typeContent,
        },
        gradients: {
          title: item.name,
          gradientType: item.typeGradient,
          colors: item.colors,
          imageUrl: validImageUrl,
          downloadUrl: item.linkDownload,
          size: item.size,
          format: item.format,
        },
        designs: {
          title: item.title,
          imageUrl: validImageUrl,
          downloadUrl: item.linkDownload,
          size: item.size,
          format: item.format,
        },
      };

      return { ...common, ...(mappings[type] || {}) };
    });

    const finalSorted = normalizedItems.sort((a, b) => {
      if (sortBy === 'popular') {
        const countA = Number(a.count) || 0;
        const countB = Number(b.count) || 0;
        if (countA !== countB) return countB - countA;
      }
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return { items: finalSorted, totalCount };
  } catch (error) {
    console.error('Error in getAssetsItems:', error);
    return { items: [], totalCount: 0 };
  }
}
