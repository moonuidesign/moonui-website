import { db } from '@/libs/drizzle';
import { contentTemplates, categoryTemplates, users } from '@/db/migration';
import { desc, asc, eq, ilike, and, sql } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import { SearchParamsProps } from '../../components';
import TemplatesClient from '@/components/dashboard/templates/client';
import { auth } from '@/libs/auth';

export default async function ListTemplate({
  searchParams,
}: {
  searchParams?: SearchParamsProps;
}) {
  const session = await auth();
  const role = session?.user?.roleUser;
  const userId = session?.user?.id;

  const search =
    typeof searchParams?.search === 'string' ? searchParams.search : undefined;
  const categoryId =
    typeof searchParams?.categoryId === 'string'
      ? searchParams.categoryId
      : undefined;
  const tier =
    typeof searchParams?.tier === 'string' ? searchParams.tier : undefined;
  const status =
    typeof searchParams?.status === 'string' ? searchParams.status : undefined;
  const sort =
    typeof searchParams?.sort === 'string'
      ? searchParams.sort
      : 'createdAt.desc';
  const page =
    typeof searchParams?.page === 'string' ? parseInt(searchParams.page) : 1;

  const ITEMS_PER_PAGE = 10;
  const limit = ITEMS_PER_PAGE;
  const offset = (page - 1) * limit;

  // Build Filters
  const filters = [];
  if (search) filters.push(ilike(contentTemplates.title, `%${search}%`));
  if (categoryId && categoryId !== 'all')
    filters.push(eq(contentTemplates.categoryTemplatesId, categoryId));
  if (tier && tier !== 'all')
    filters.push(eq(contentTemplates.tier, tier as any));
  if (status && status !== 'all')
    filters.push(eq(contentTemplates.statusContent, status));

  if (role === 'admin' && userId) {
    filters.push(eq(contentTemplates.userId, userId));
  }

  // Build Sort
  let orderBy = desc(contentTemplates.createdAt);
  if (sort === 'createdAt.asc') orderBy = asc(contentTemplates.createdAt);
  else if (sort === 'title.asc') orderBy = asc(contentTemplates.title);
  else if (sort === 'title.desc') orderBy = desc(contentTemplates.title);
  else if (sort === 'viewCount.desc')
    orderBy = desc(contentTemplates.viewCount);
  else if (sort === 'downloadCount.desc')
    orderBy = desc(contentTemplates.downloadCount);

  // Fetch paginated data
  const data = await db
    .select({
      id: contentTemplates.id,
      title: contentTemplates.title,
      urlPreview: contentTemplates.urlPreview,
      typeContent: contentTemplates.typeContent,
      imagesUrl: contentTemplates.imagesUrl,
      tier: contentTemplates.tier,
      statusContent: contentTemplates.statusContent,
      viewCount: contentTemplates.viewCount,
      downloadCount: contentTemplates.downloadCount,
      createdAt: contentTemplates.createdAt,
      categoryName: categoryTemplates.name,
      authorName: users.name,
    })
    .from(contentTemplates)
    .leftJoin(
      categoryTemplates,
      eq(contentTemplates.categoryTemplatesId, categoryTemplates.id),
    )
    .leftJoin(users, eq(contentTemplates.userId, users.id))
    .where(and(...filters))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Fetch total count
  const totalItemsResult = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(contentTemplates)
    .leftJoin(
      categoryTemplates,
      eq(contentTemplates.categoryTemplatesId, categoryTemplates.id),
    )
    .where(and(...filters));

  const totalItems = totalItemsResult[0]?.count || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const categoriesData = await db
    .select({
      label: categoryTemplates.name,
      value: categoryTemplates.id,
    })
    .from(categoryTemplates);

  const templates = data.map((item) => {
    // Helper untuk handle array gambar
    const rawImages = Array.isArray(item.imagesUrl) ? item.imagesUrl : [];

    // Format URL (tambahkan domain R2 jika path relatif)
    const formattedImages = rawImages.map((img: any) => ({
      url:
        img.url && !img.url.startsWith('http')
          ? `https://${process.env.R2_PUBLIC_DOMAIN}/${img.url}`
          : img.url,
    }));

    console.log('Formatted Images:', formattedImages);
    return {
      id: item.id,
      title: item.title,
      urlPreview: item.urlPreview,
      typeContent: item.typeContent,
      images: formattedImages, // <--- MASUKKAN KE SINI
      tier: item.tier,
      statusContent: item.statusContent,
      viewCount: item.viewCount,
      downloadCount: item.downloadCount,
      createdAt: item.createdAt ? item.createdAt.toISOString() : '',
      categoryName: item.categoryName || undefined,
      authorName: item.authorName || 'Unknown',
    };
  });
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Templates</h1>
        <Link href="/dashboard/content/templates/create">
          <Button>+ New Template</Button>
        </Link>
      </div>
      <TemplatesClient
        data={templates}
        categories={categoriesData}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        }}
        isSuperAdmin={role === 'superadmin'}
      />
    </div>
  );
}
