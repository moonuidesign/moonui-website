import { getCategoryDesigns } from '@/server-action/getCategoryComponent';
import { db } from '@/libs/drizzle';
import { contentDesigns, categoryDesigns } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import DesignForm from '@/components/dashboard/design/design-form';

export default async function EditDesign({ id }: { id: string }) {
  const design = await db
    .select({
      id: contentDesigns.id,
      title: contentDesigns.title,
      description: contentDesigns.description,
      categoryDesignsId: contentDesigns.categoryDesignsId,
      tier: contentDesigns.tier,
      statusContent: contentDesigns.statusContent,
      slug: contentDesigns.slug,
      size: contentDesigns.size,
      format: contentDesigns.format,
      imagesUrl: contentDesigns.imagesUrl, // Changed from imageUrl
      linkDownload: contentDesigns.linkDownload, // Added
      urlBuyOneTime: contentDesigns.urlBuyOneTime, // Added
      category: {
        name: categoryDesigns.name,
      },
    })
    .from(contentDesigns)
    .leftJoin(categoryDesigns, eq(contentDesigns.categoryDesignsId, categoryDesigns.id))
    .where(eq(contentDesigns.id, id))
    .limit(1);

  if (!design[0]) {
    notFound();
  }

  const designData = design[0];
  const formattedDesign = {
    ...designData,

    imagesUrl: Array.isArray(designData.imagesUrl)
      ? (designData.imagesUrl as string[]).map((url) =>
          url.startsWith('http') ? url : `https://${process.env.R2_PUBLIC_DOMAIN}/${url}`,
        )
      : [],
    linkDownload:
      designData.linkDownload && !designData.linkDownload.startsWith('http')
        ? `https://${process.env.R2_PUBLIC_DOMAIN}/${designData.linkDownload}`
        : designData.linkDownload,
  };

  const categories = await getCategoryDesigns();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Edit Design</h1>
      <DesignForm design={formattedDesign} categories={categories} />
    </div>
  );
}
