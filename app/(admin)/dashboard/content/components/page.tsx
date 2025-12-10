import { db } from '@/libs/drizzle';
import { contentComponents, categoryComponents } from '@/db/migration/schema';
import { desc, eq } from 'drizzle-orm';

export default async function ComponentsPage() {
  const data = await db
    .select({
      id: contentComponents.id,
      title: contentComponents.title,
      typeContent: contentComponents.typeContent,
      imageUrl: contentComponents.imageUrl, // Remove '?? null', Drizzle handles this
      viewCount: contentComponents.viewCount,
      copyCount: contentComponents.copyCount,
      createdAt: contentComponents.createdAt,
      category: {
        name: categoryComponents.name,
      },
    })
    .from(contentComponents)
    .leftJoin(
      categoryComponents,
      eq(contentComponents.categoryComponentsId, categoryComponents.id),
    )
    .orderBy(desc(contentComponents.createdAt));

  const components = data.map((item) => ({
    ...item,
    imageUrl: item.imageUrl ?? undefined,

    category: item.category ?? undefined,
    createdAt: item.createdAt ? item.createdAt.toISOString() : '',
  }));
  return <ComponentsList components={components} />;
}
