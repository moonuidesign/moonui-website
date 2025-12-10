import { getCategoriesWithSubCategories } from '@/server-action/getCategoryComponent';
import { db } from '@/libs/drizzle';
import { contentDesigns, categoryDesigns } from '@/db/migration/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { DesignForm } from '../../DesignForm';

interface EditDesignPageProps {
  params: {
    id: string;
  };
}

export default async function EditDesignPage({ params }: EditDesignPageProps) {
  const design = await db
    .select({
      id: contentDesigns.id,
      title: contentDesigns.title,
      description: contentDesigns.description,
      categoryDesignsId: contentDesigns.categoryDesignsId,
      tier: contentDesigns.tier,
      statusContent: contentDesigns.statusContent,
      slug: contentDesigns.slug,
      imageUrl: contentDesigns.imageUrl,
      category: {
        name: categoryDesigns.name,
      },
    })
    .from(contentDesigns)
    .leftJoin(
      categoryDesigns,
      eq(contentDesigns.categoryDesignsId, categoryDesigns.id),
    )
    .where(eq(contentDesigns.id, params.id))
    .limit(1);

  if (!design[0]) {
    notFound();
  }

  const categories = await getCategoriesWithSubCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Design</h1>
      <DesignForm design={design[0]} categories={categories} />
    </div>
  );
}
