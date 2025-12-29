'use server';

import { db } from '@/libs/drizzle';
import { eq, inArray, desc, and, sql, ilike, or, isNull } from 'drizzle-orm';
import {
    contentComponents,
    contentTemplates,
    contentGradients,
    contentDesigns,
    categoryComponents,
    categoryTemplates,
    categoryGradients,
    categoryDesigns,
    users
} from '@/db/migration';

// Map types to tables
const typeConfig = {
    components: {
        content: contentComponents,
        category: categoryComponents,
        catIdField: contentComponents.categoryComponentsId,
        catNameField: categoryComponents.name
    },
    templates: {
        content: contentTemplates,
        category: categoryTemplates,
        catIdField: contentTemplates.categoryTemplatesId,
        catNameField: categoryTemplates.name
    },
    gradients: {
        content: contentGradients,
        category: categoryGradients,
        catIdField: contentGradients.categoryGradientsId,
        catNameField: categoryGradients.name
    },
    designs: {
        content: contentDesigns,
        category: categoryDesigns,
        catIdField: contentDesigns.categoryDesignsId,
        catNameField: categoryDesigns.name
    }
};

interface FetchParams {
    categorySlug: string;
    limit: number;
    offset?: number;
    contentType?: string;
    tiers?: string[];
    tool?: string;
    sortBy?: 'recent' | 'popular';
    searchQuery?: string;
}

async function fetchItemsForCategory({
    categorySlug,
    limit,
    offset = 0,
    contentType = 'components',
    tiers,
    tool = 'figma',
    sortBy = 'recent',
    searchQuery = ''
}: FetchParams) {
    const config = typeConfig[contentType as keyof typeof typeConfig] || typeConfig.components;

    // Normalize tool - Handle case sensitivity
    const toolFilter = tool === 'framer'
        ? ['framer', 'Framer', 'react', 'React']
        : [tool, tool.charAt(0).toUpperCase() + tool.slice(1)];

    // 2. Build Conditions
    const conditions = [];

    // CATEGORY FILTER
    // Only filter by category if slug is NOT 'all'
    if (categorySlug && categorySlug !== 'all') {
        const categoryModelName = config.category === categoryComponents ? 'categoryComponents' :
            config.category === categoryTemplates ? 'categoryTemplates' :
                config.category === categoryGradients ? 'categoryGradients' : 'categoryDesigns';

        // 1. Find Category IDs by Name (Wildcard Match)
        const categories = await (db.query[categoryModelName] as any).findMany({
            where: ilike(config.catNameField, `%${categorySlug}%`),
        });

        // If specific category requested but none found, return empty
        if (!categories || categories.length === 0) {
            console.log(`[getAssets2Data] Category not found for slug: ${categorySlug}`);
            return { items: [], totalCount: 0 };
        }

        let categoryIds = categories.map((c: any) => c.id);

        // FETCH SUBCATEGORIES (Children)
        // If we found "Marketing" (with ID 1), also get "Landing Page" (if parentId === 1).
        try {
            const parentIdField = (config.category as any).parentId;

            // Only attempt to fetch subcategories if parentId exists on schema object
            // (It should exist for all category tables per current migration import)
            if (parentIdField) {
                const subCategories = await (db.query[categoryModelName] as any).findMany({
                    where: inArray(parentIdField, categoryIds)
                });

                if (subCategories && subCategories.length > 0) {
                    const subCategoryIds = subCategories.map((c: any) => c.id);
                    categoryIds = [...categoryIds, ...subCategoryIds];
                }
            }
        } catch (err) {
            console.error('[getAssets2Data] Error fetching subcategories:', err);
        }

        conditions.push(inArray(config.catIdField, categoryIds));
    }

    // Status (published)
    if (contentType !== 'gradients') {
        const statusField = (config.content as any).statusContent;
        if (statusField) conditions.push(eq(statusField, 'published'));
    }

    // Type/Tool Filter
    if (contentType === 'components' || contentType === 'templates' || contentType === 'designs') {
        let typeField;
        if (contentType === 'designs') {
            typeField = (config.content as any).format;
        } else {
            typeField = (config.content as any).typeContent;
        }

        conditions.push(inArray(typeField, toolFilter));
    }

    // Tier Filter (Multi-select)
    if (tiers && tiers.length > 0) {
        conditions.push(inArray((config.content as any).tier, tiers));
    }

    // Search Query
    if (searchQuery) {
        // 1. Find Author IDs matching the name
        // We need to import 'users' table or access it via db.query.users if available, 
        // or just use the reference if imported. 
        // Since 'users' is not in the top imports, we need to import it or use a raw query/db.query if configured.
        // Assuming db.query.users exists based on schemas.
        
        let authorIds: string[] = [];
        try {
            const matchedUsers = await db.query.users.findMany({
                where: ilike(users.name, `%${searchQuery}%`),
                columns: { id: true }
            });
            authorIds = matchedUsers.map((u: any) => u.id);
        } catch (err) {
            console.error('[getAssets2Data] Error searching users:', err);
        }

        const titleField = (config.content as any).title || (config.content as any).name;
        // Handle slug (JSONB) - assume slug->>'current' or just cast to text if strict structure unknown
        // For safety with Drizzle and JSONB, using sql operator
        const slugField = sql`${(config.content as any).slug}->>'current'`;

        const searchConditions = [];
        
        // Title Match
        if (titleField) {
            searchConditions.push(ilike(titleField, `%${searchQuery}%`));
        }
        
        // Slug Match
        searchConditions.push(ilike(slugField, `%${searchQuery}%`));

        // Author Match
        if (authorIds.length > 0) {
            searchConditions.push(inArray((config.content as any).userId, authorIds));
        }

        if (searchConditions.length > 0) {
            conditions.push(or(...searchConditions));
        }
    }

    // 3. Fetch Items
    const contentModel = config.content === contentComponents ? 'contentComponents' :
        config.content === contentTemplates ? 'contentTemplates' :
        config.content === contentGradients ? 'contentGradients' : 'contentDesigns';

    // Determine Sort Order
    let order: any = desc((config.content as any).createdAt);
    if (sortBy === 'popular') {
        if (contentType === 'components') {
            order = desc((config.content as any).copyCount);
        } else {
            order = desc((config.content as any).downloadCount);
        }
    }

    // Get Total Count
    const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(config.content)
        .where(and(...conditions));
    const totalCount = Number(countResult[0]?.count || 0);

    // Fetch Content
    const items = await (db.query[contentModel] as any).findMany({
        where: and(...conditions),
        limit: limit,
        offset: offset,
        orderBy: [order],
        with: {
            category: true,
            ...(contentType !== 'gradients' ? { user: true } : {})
        }
    });

    console.log(`[getAssets2Data] fetchItemsForCategory:`, {
        categorySlug, contentType, tool, limit, offset, found: items.length, totalCount, conditionsCount: conditions.length
    });

    return {
        items: items.map((item: any) => transformItem(item, contentType)),
        totalCount
    };
}

function transformItem(item: any, type: string) {
    let validImageUrl = item.imageUrl || item.image || '';
    if (!validImageUrl && item.imagesUrl) {
        validImageUrl = Array.isArray(item.imagesUrl)
            ? item.imagesUrl[0]
            : item.imagesUrl;
    }

    const catSlug = item.category?.slug || item.category?.name?.toLowerCase() || '';
    const slug = item.slug?.current || item.slug;

    return {
        id: item.id,
        title: item.title || item.name,
        imageUrl: validImageUrl,
        categorySlug: catSlug,
        categoryName: item.category?.name,
        author: item.user?.name || 'MoonUI Team',
        tier: item.tier,
        type: type,
        slug: slug,
        link: `/assets/${type}/${slug}`,
        copyData: item.copyComponentTextHTML || '',
        downloadUrl: item.linkDonwload || item.linkDownload || '',
        createdAt: item.createdAt, 
    };
}

export async function getOverviewData(contentType: string = 'components', tiers: string[] = [], tool: string = 'figma') {
    // Dynamic Categories: Fetch ALL root categories from DB
    const config = typeConfig[contentType as keyof typeof typeConfig] || typeConfig.components;

    // Note: TypeScript might struggle with isNull inference on 'any' cast column, 
    // but at runtime `isNull` expects a column object. 
    // `config.category` is the schema object (e.g. categoryComponents).
    // `(config.category as any).parentId` accesses the field.

    const categoryModel = config.category === categoryComponents ? 'categoryComponents' :
        config.category === categoryTemplates ? 'categoryTemplates' :
            config.category === categoryGradients ? 'categoryGradients' : 'categoryDesigns';

    // Fetch ROOT categories (parentId is null)
    let allCategories = [];
    try {
        allCategories = await (db.query[categoryModel] as any).findMany({
            where: isNull((config.category as any).parentId),
            orderBy: [desc((config.category as any).createdAt)]
        });
    } catch (err) {
        console.error('[getAssets2Data] Error fetching root categories:', err);
        return {};
    }

    // keys for grouping
    const targetCategories = allCategories.map((c: any) => c.name);

    if (targetCategories.length === 0) {
        console.log('[getOverviewData] No categories found for', contentType);
        return {};
    }

    const results = await Promise.all(targetCategories.map(async (catName: string) => {
        const { items } = await fetchItemsForCategory({
            categorySlug: catName,
            limit: 6,
            contentType,
            tiers,
            tool
        });
        return { catName, items };
    }));

    const overviewData: Record<string, any[]> = {};
    results.forEach(({ catName, items }) => {
        if (items.length > 0) {
            overviewData[catName] = items;
        }
    });

    return overviewData;
}

export async function getInfiniteData(
    categorySlug: string,
    limit: number,
    offset: number,
    contentType: string,
    tiers: string[] = [],
    tool: string = 'figma',
    sortBy: 'recent' | 'popular' = 'recent',
    searchQuery: string = ''
) {
    return await fetchItemsForCategory({
        categorySlug,
        limit,
        offset,
        contentType,
        tiers,
        tool,
        sortBy,
        searchQuery
    });
}

export async function getAllCategories(contentType: string = 'components') {
    const config = typeConfig[contentType as keyof typeof typeConfig] || typeConfig.components;

    const categoryModel = config.category === categoryComponents ? 'categoryComponents' :
        config.category === categoryTemplates ? 'categoryTemplates' :
            config.category === categoryGradients ? 'categoryGradients' : 'categoryDesigns';

    const cats = await (db.query[categoryModel] as any).findMany({
        orderBy: [desc((config.category as any).createdAt)]
    });

    return cats.map((c: any) => ({
        ...c,
        slug: c.name.toLowerCase()
    }));
}
