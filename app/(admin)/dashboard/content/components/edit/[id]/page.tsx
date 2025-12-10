import { getCategoriesWithSubCategories } from '@/server-action/getCategoryComponent';
import { db } from '@/libs/drizzle';
import { contentComponents } from '@/db/migration/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ComponentForm } from '../../../../../../../components/EditComponentForm';
interface EditComponentPageProps {
  params: {
    id: string;
  };
}

export default async function EditComponentPage({
  params,
}: EditComponentPageProps) {
  // 1. Fetch Data Komponen
  const data = await db
    .select()
    .from(contentComponents)
    .where(eq(contentComponents.id, params.id))
    .limit(1);

  const componentRaw = data[0];

  if (!componentRaw) {
    notFound();
  }

  const categories = await getCategoriesWithSubCategories();

  const formattedComponent = {
    ...componentRaw,
    copyComponentTextHTML: componentRaw.copyComponentTextHTML as string,
    copyComponentTextPlain: componentRaw.copyComponentTextPlain as string,
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Kirim data yang sudah diformat */}
      <ComponentForm component={formattedComponent} categories={categories} />
    </div>
  );
}
