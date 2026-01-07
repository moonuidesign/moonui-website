import type { MetadataRoute } from 'next';
import { db } from '@/libs/drizzle';
import {
  categoryComponents,
  categoryTemplates,
  categoryGradients,
  categoryDesigns,
  contentComponents,
  contentTemplates,
  contentGradients,
  contentDesigns,
} from '@/db';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://moonui.design';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // Assets main page
    {
      url: `${baseUrl}/assets`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Dynamic pages from database - Categories & Content Items
  const [
    compCategories,
    templateCategories,
    gradientCategories,
    designCategories,
    components,
    templates,
    gradients,
    designs,
  ] = await Promise.all([
    db
      .select({ name: categoryComponents.name, updatedAt: categoryComponents.updatedAt })
      .from(categoryComponents),
    db
      .select({ name: categoryTemplates.name, updatedAt: categoryTemplates.updatedAt })
      .from(categoryTemplates),
    db
      .select({ name: categoryGradients.name, updatedAt: categoryGradients.updatedAt })
      .from(categoryGradients),
    db
      .select({ name: categoryDesigns.name, updatedAt: categoryDesigns.updatedAt })
      .from(categoryDesigns),
    // Content items for detail pages
    db
      .select({ id: contentComponents.id, updatedAt: contentComponents.updatedAt })
      .from(contentComponents)
      .where(eq(contentComponents.statusContent, 'published')),
    db
      .select({ id: contentTemplates.id, updatedAt: contentTemplates.updatedAt })
      .from(contentTemplates)
      .where(eq(contentTemplates.statusContent, 'published')),
    db
      .select({ id: contentGradients.id, updatedAt: contentGradients.updatedAt })
      .from(contentGradients),
    db
      .select({ id: contentDesigns.id, updatedAt: contentDesigns.updatedAt })
      .from(contentDesigns)
      .where(eq(contentDesigns.statusContent, 'published')),
  ]);

  // Helper to convert name to URL-safe format
  const toSlug = (name: string) => encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));

  const categoryPages: MetadataRoute.Sitemap = [
    ...compCategories.map((cat) => ({
      url: `${baseUrl}/assets?type=components&category=${toSlug(cat.name)}`,
      lastModified: cat.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...templateCategories.map((cat) => ({
      url: `${baseUrl}/assets?type=templates&category=${toSlug(cat.name)}`,
      lastModified: cat.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...gradientCategories.map((cat) => ({
      url: `${baseUrl}/assets?type=gradients&category=${toSlug(cat.name)}`,
      lastModified: cat.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...designCategories.map((cat) => ({
      url: `${baseUrl}/assets?type=designs&category=${toSlug(cat.name)}`,
      lastModified: cat.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];

  // Asset type filter pages
  const assetTypePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/assets?type=components`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/assets?type=templates`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/assets?type=gradients`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/assets?type=designs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
  ];

  // Detail pages for individual assets
  const detailPages: MetadataRoute.Sitemap = [
    ...components.map((item) => ({
      url: `${baseUrl}/assets/components/${item.id}`,
      lastModified: item.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...templates.map((item) => ({
      url: `${baseUrl}/assets/templates/${item.id}`,
      lastModified: item.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...gradients.map((item) => ({
      url: `${baseUrl}/assets/gradients/${item.id}`,
      lastModified: item.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...designs.map((item) => ({
      url: `${baseUrl}/assets/designs/${item.id}`,
      lastModified: item.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];

  return [...staticPages, ...assetTypePages, ...categoryPages, ...detailPages];
}
