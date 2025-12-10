'use server';

import { db } from '@/libs/drizzle';
import { eq, desc } from 'drizzle-orm';
import {
  contentComponents,
  contentTemplates,
  contentGradients,
  contentDesigns,
  categoryComponents,
  categoryTemplates,
  categoryGradients,
  categoryDesigns,
} from '@/db/migration/schema';

export async function getAssetsData() {
  try {
    const [
      // 1. Fetch Categories
      catComponents,
      catTemplates,
      catGradients,
      catDesigns,

      // 2. Fetch Content Items
      itemsComponents,
      itemsTemplates,
      itemsGradients,
      itemsDesigns,
    ] = await Promise.all([
      // Categories
      db.query.categoryComponents.findMany(),
      db.query.categoryTemplates.findMany(),
      db.query.categoryGradients.findMany(),
      db.query.categoryDesigns.findMany(),

      // Content Items (only published/relevant ones if needed, assuming all for now or check status)
      db.query.contentComponents.findMany({
        where: eq(contentComponents.statusContent, 'published'),
        with: { category: true },
        orderBy: [desc(contentComponents.createdAt)],
      }),
      db.query.contentTemplates.findMany({
        where: eq(contentTemplates.statusContent, 'published'),
        with: { category: true },
        orderBy: [desc(contentTemplates.createdAt)],
      }),
      db.query.contentGradients.findMany({
        with: { category: true },
        orderBy: [desc(contentGradients.createdAt)],
      }),
      db.query.contentDesigns.findMany({
        where: eq(contentDesigns.statusContent, 'published'),
        with: { category: true },
        orderBy: [desc(contentDesigns.createdAt)],
      }),
    ]);

    // Map Categories
    const mapCategory = (c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.name, // Assuming slug is name for now, or add slug field if exists in schema
      count: 0, // Calculate counts if needed
    });

    const componentCategories = catComponents.map(mapCategory);
    const templateCategories = catTemplates.map(mapCategory);
    const gradientCategories = catGradients.map(mapCategory);
    const designCategories = catDesigns.map(mapCategory);

    // Map Items
    const allItems: any[] = [];

    // Components
    itemsComponents.forEach((item) => {
      allItems.push({
        id: item.id,
        title: item.title,
        type: 'components',
        categorySlug: item.category?.name || 'Uncategorized',
        tier: item.tier,
        imageUrl: item.imageUrl,
        slug: item.slug?.current, // Assuming slug is stored as json object { current: '...' }
        createdAt: item.createdAt,
        platform: item.platform,
      });
    });

    // Templates
    itemsTemplates.forEach((item) => {
      allItems.push({
        id: item.id,
        title: item.title,
        type: 'templates',
        categorySlug: item.category?.name || 'Uncategorized',
        tier: item.tier,
        imageUrl: item.urlPreview || item.imageUrl || '', // prioritizing preview
        slug: item.slug?.current,
        platform: item.platform,
        createdAt: item.createdAt,
      });
    });

    // Gradients
    itemsGradients.forEach((item) => {
      allItems.push({
        id: item.id,
        title: item.name,
        type: 'gradients',
        categorySlug: item.category?.name || 'Uncategorized',
        gradientType: item.typeGradient,
        tier: item.tier,
        colors: item.colors, // Assuming this is array of strings
        slug: item.slug?.current,
        createdAt: item.createdAt,
      });
    });

    // Designs
    itemsDesigns.forEach((item) => {
      allItems.push({
        id: item.id,
        title: item.title,
        type: 'designs',
        categorySlug: item.category?.name || 'Uncategorized',
        tier: item.tier,
        imageUrl: item.imageUrl,
        slug: item.slug?.current,
        createdAt: item.createdAt,
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
    console.error('Error fetching assets data:', error);
    return {
      allItems: [],
      componentCategories: [],
      templateCategories: [],
      gradientCategories: [],
      designCategories: [],
    };
  }
}
