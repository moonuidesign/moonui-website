import { db } from '@/libs/drizzle';
import { getCategoryGradients } from '@/server-action/getCategoryComponent';
import { contentGradients, categoryGradients } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import GradientForm from '@/components/dashboard/gradient/gradient-form';

export default async function EditGradient({ id }: { id: string }) {
  const gradient = await db
    .select({
      id: contentGradients.id,
      name: contentGradients.name,
      slug: contentGradients.slug,
      colors: contentGradients.colors,
      number: contentGradients.number,
      typeGradient: contentGradients.typeGradient,
      image: contentGradients.image,
      linkDownload: contentGradients.linkDownload,
      size: contentGradients.size,
      format: contentGradients.format,
      urlBuyOneTime: contentGradients.urlBuyOneTime,
      tier: contentGradients.tier,
      categoryGradientsId: contentGradients.categoryGradientsId,
      category: {
        name: categoryGradients.name,
      },
    })
    .from(contentGradients)
    .leftJoin(categoryGradients, eq(contentGradients.categoryGradientsId, categoryGradients.id))
    .where(eq(contentGradients.id, id))
    .limit(1);

  if (!gradient[0]) {
    notFound();
  }

  const categories = await getCategoryGradients();

  const formattedGradient = {
    ...gradient[0],
    image:
      gradient[0].image && !gradient[0].image.startsWith('http')
        ? `https://${process.env.R2_PUBLIC_DOMAIN}/${gradient[0].image}`
        : gradient[0].image,
    linkDownload:
      gradient[0].linkDownload && !gradient[0].linkDownload.startsWith('http')
        ? `https://${process.env.R2_PUBLIC_DOMAIN}/${gradient[0].linkDownload}`
        : gradient[0].linkDownload,
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Edit Gradient</h1>
      <GradientForm gradient={formattedGradient} categories={categories} />
    </div>
  );
}
