import { getCategoryTemplates } from '@/server-action/getCategoryComponent';
import { db } from '@/libs/drizzle';
import { contentTemplates, categoryTemplates } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { TemplateForm } from '@/components';

export default async function EditTemplate({ id }: { id: string }) {
  const template = await db
    .select({
      id: contentTemplates.id,
      title: contentTemplates.title,
      description: contentTemplates.description,
      typeContent: contentTemplates.typeContent,

      linkDonwload: contentTemplates.linkDonwload,
      assetUrl: contentTemplates.assetUrl,
      categoryTemplatesId: contentTemplates.categoryTemplatesId,
      // Add missing fields required by TemplateEntity
      tier: contentTemplates.tier,
      urlBuyOneTime: contentTemplates.urlBuyOneTime,

      statusContent: contentTemplates.statusContent,
      slug: contentTemplates.slug,
      category: {
        name: categoryTemplates.name,
      },
    })
    .from(contentTemplates)
    .leftJoin(
      categoryTemplates,
      eq(contentTemplates.categoryTemplatesId, categoryTemplates.id),
    )
    .where(eq(contentTemplates.id, id))
    .limit(1);

  if (!template[0]) {
    notFound();
  }

  const categories = await getCategoryTemplates();
  
  // Platform is not in schema, default to 'web'
  // Prepend R2_PUBLIC_DOMAIN to assets and linkDownload
  const formattedTemplate = {
    ...template[0],
    platform: 'web',
    assetUrl: (template[0].assetUrl as any[])?.map((asset) => ({
      ...asset,
      url:
        asset.url && !asset.url.startsWith('http')
          ? `https://${process.env.R2_PUBLIC_DOMAIN}/${asset.url}`
          : asset.url,
    })),
    linkDonwload:
      template[0].linkDonwload && !template[0].linkDonwload.startsWith('http')
        ? `https://${process.env.R2_PUBLIC_DOMAIN}/${template[0].linkDonwload}`
        : template[0].linkDonwload,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Template</h1>
      <TemplateForm template={formattedTemplate} categories={categories} />
    </div>
  );
}
