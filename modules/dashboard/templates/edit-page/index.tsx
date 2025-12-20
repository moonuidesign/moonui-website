import { getCategoryTemplates } from '@/server-action/getCategoryComponent';
import { db } from '@/libs/drizzle';
import { contentTemplates, categoryTemplates } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import TemplateForm from '@/components/dashboard/templates/template-form';

export default async function EditTemplate({ id }: { id: string }) {
  // 2. Gunakan Promise.all untuk mengambil Template dan Kategori secara paralel
  const [templateResult, categories] = await Promise.all([
    db
      .select({
        id: contentTemplates.id,
        title: contentTemplates.title,
        description: contentTemplates.description,
        typeContent: contentTemplates.typeContent,
        linkDonwload: contentTemplates.linkDonwload, // Typo di DB dipertahankan
        imagesUrl: contentTemplates.imagesUrl,
        categoryTemplatesId: contentTemplates.categoryTemplatesId,
        tier: contentTemplates.tier,
        format: contentTemplates.format,
        size: contentTemplates.size,
        urlPreview: contentTemplates.urlPreview,
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
      .limit(1),

    getCategoryTemplates(),
  ]);

  // 3. Ambil item pertama dari array (Destructuring manual pengganti findFirst)
  const template = templateResult[0];

  // Jika tidak ditemukan, return 404
  if (!template) {
    notFound();
  }

  // 4. Helper function untuk formatting URL (R2/S3)
  const getAbsoluteUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Jika sudah ada https, biarkan
    return `https://${process.env.R2_PUBLIC_DOMAIN}/${path}`;
  };

  // 5. Format data agar sesuai dengan yang diharapkan Form
  const formattedTemplate = {
    ...template,

    // Handle imagesUrl: Pastikan array, lalu map URL-nya
    imagesUrl: (Array.isArray(template.imagesUrl)
      ? template.imagesUrl
      : []
    ).map((asset: any) => ({
      ...asset,
      url: getAbsoluteUrl(asset.url),
    })),

    // Handle link download
    linkDonwload: getAbsoluteUrl(template.linkDonwload),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Template</h1>
      <TemplateForm template={formattedTemplate} categories={categories} />
    </div>
  );
}
