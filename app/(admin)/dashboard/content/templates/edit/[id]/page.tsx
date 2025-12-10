import { EditTemplateForm } from './EditTemplateForm';
import { getCategoriesWithSubCategories } from '@/server-action/getCategoryComponent';
import { db } from '@/libs/drizzle';
import { contentTemplates, categoryTemplates } from '@/db/migration/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

interface EditTemplatePageProps {
  params: {
    id: string;
  };
}

export default async function EditTemplatePage({
  params,
}: EditTemplatePageProps) {
  const template = await db
    .select({
      id: contentTemplates.id,
      title: contentTemplates.title,
      description: contentTemplates.description,
      typeContent: contentTemplates.typeContent,
      linkTemplate: contentTemplates.linkTemplate,
      linkDownload: contentTemplates.linkDownload,
      assetUrl: contentTemplates.assetUrl,
      categoryTemplatesId: contentTemplates.categoryTemplatesId,
      category: {
        name: categoryTemplates.name,
      },
    })
    .from(contentTemplates)
    .leftJoin(
      categoryTemplates,
      eq(contentTemplates.categoryTemplatesId, categoryTemplates.id),
    )
    .where(eq(contentTemplates.id, params.id))
    .limit(1);

  if (!template[0]) {
    notFound();
  }

  const categories = await getCategoriesWithSubCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Template</h1>
      <EditTemplateForm template={template[0]} categories={categories} />
    </div>
  );
}
