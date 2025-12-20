import { db } from '@/libs/drizzle';
import { contentGradients, categoryGradients, users } from '@/db/migration';
import { desc, asc, eq, ilike, and, sql } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchParamsProps } from '../../components';
import { auth } from '@/libs/auth';
import GradientsClient from '@/components/dashboard/gradient/client';

export default async function ListGradient({
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
  if (search) filters.push(ilike(contentGradients.name, `%${search}%`));
  if (categoryId && categoryId !== 'all')
    filters.push(eq(contentGradients.categoryGradientsId, categoryId));
  if (tier && tier !== 'all')
    filters.push(eq(contentGradients.tier, tier as any));

  if (role === 'admin' && userId) {
    filters.push(eq(contentGradients.userId, userId));
  }

  // Build Sort
  let orderBy = desc(contentGradients.createdAt);
  if (sort === 'createdAt.asc') orderBy = asc(contentGradients.createdAt);
  else if (sort === 'title.asc')
    orderBy = asc(contentGradients.name); // Using name for gradients
  else if (sort === 'title.desc') orderBy = desc(contentGradients.name);
  else if (sort === 'downloadCount.desc')
    orderBy = desc(contentGradients.downloadCount);

  // Fetch paginated data
  const data = await db
    .select({
      id: contentGradients.id,
      name: contentGradients.name,
      image: contentGradients.image,
      typeGradient: contentGradients.typeGradient,
      tier: contentGradients.tier,
      downloadCount: contentGradients.downloadCount,
      createdAt: contentGradients.createdAt,
      categoryName: categoryGradients.name,
      authorName: users.name,
    })
    .from(contentGradients)
    .leftJoin(
      categoryGradients,
      eq(contentGradients.categoryGradientsId, categoryGradients.id),
    )
    .leftJoin(users, eq(contentGradients.userId, users.id))
    .where(and(...filters))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Fetch total count
  const totalItemsResult = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(contentGradients)
    .leftJoin(
      categoryGradients,
      eq(contentGradients.categoryGradientsId, categoryGradients.id),
    )
    .where(and(...filters));

  const totalItems = totalItemsResult[0]?.count || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const categoriesData = await db
    .select({
      label: categoryGradients.name,
      value: categoryGradients.id,
    })
    .from(categoryGradients);

  // --- PERBAIKAN DI SINI ---
  const gradients = data.map((item) => ({
    id: item.id,
    name: item.name,
    // Cek apakah image sudah berupa URL lengkap (dimulai dengan http/https)
    // Jika ya, pakai as-is. Jika tidak, tambahkan domain R2.
    image: item.image?.startsWith('http')
      ? item.image
      : `https://${process.env.R2_PUBLIC_DOMAIN}/${item.image}`,
    typeGradient: item.typeGradient,
    tier: item.tier,
    downloadCount: item.downloadCount,
    createdAt: item.createdAt ? item.createdAt.toISOString() : '',
    categoryName: item.categoryName || undefined,
    authorName: item.authorName || 'Unknown',
  }));
  // -------------------------

  console.log(gradients);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gradients</h1>
        <Link href="/dashboard/content/gradients/create">
          <Button>+ New Gradient</Button>
        </Link>
      </div>
      <GradientsClient
        data={gradients}
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
