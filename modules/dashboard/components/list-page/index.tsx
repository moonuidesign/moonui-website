import { db } from '@/libs/drizzle';
import { contentComponents, categoryComponents, users } from '@/db/migration';
import { desc, asc, eq, ilike, and, sql } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ComponentsClient from '@/components/dashboard/components/client';
import { auth } from '@/libs/auth';

export type SearchParamsProps = {
  [key: string]: string | string[] | undefined;
};

const ITEMS_PER_PAGE = 10;

export default async function ListComponent({
  searchParams,
}: {
  searchParams: SearchParamsProps;
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

  const limit = ITEMS_PER_PAGE;
  const offset = (page - 1) * limit;

  // Build Filters
  const filters = [];
  if (search) filters.push(ilike(contentComponents.title, `%${search}%`));
  if (categoryId && categoryId !== 'all')
    filters.push(eq(contentComponents.categoryComponentsId, categoryId));
  if (tier && tier !== 'all')
    filters.push(eq(contentComponents.tier, tier as any));
  if (status && status !== 'all')
    filters.push(eq(contentComponents.statusContent, status));

  // Admin-specific filter: Only show own items
  if (role === 'admin' && userId) {
    filters.push(eq(contentComponents.userId, userId));
  }

  // Build Sort
  let orderBy = desc(contentComponents.createdAt);
  if (sort === 'createdAt.asc') orderBy = asc(contentComponents.createdAt);
  else if (sort === 'title.asc') orderBy = asc(contentComponents.title);
  else if (sort === 'title.desc') orderBy = desc(contentComponents.title);
  else if (sort === 'viewCount.desc')
    orderBy = desc(contentComponents.viewCount);
  else if (sort === 'copyCount.desc')
    orderBy = desc(contentComponents.copyCount);

  // Fetch paginated data
  const data = await db
    .select({
      id: contentComponents.id,
      title: contentComponents.title,
      typeContent: contentComponents.typeContent,
      imageUrl: contentComponents.imageUrl,
      viewCount: contentComponents.viewCount,
      copyCount: contentComponents.copyCount,
      tier: contentComponents.tier,
      createdAt: contentComponents.createdAt,
      categoryName: categoryComponents.name,
      authorName: users.name,
    })
    .from(contentComponents)
    .leftJoin(
      categoryComponents,
      eq(contentComponents.categoryComponentsId, categoryComponents.id),
    )
    .leftJoin(users, eq(contentComponents.userId, users.id))
    .where(and(...filters))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Fetch total count
  const totalItemsResult = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(contentComponents)
    .leftJoin(
      categoryComponents,
      eq(contentComponents.categoryComponentsId, categoryComponents.id),
    )
    .where(and(...filters));

  const totalItems = totalItemsResult[0]?.count || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const components = data.map((item) => ({
    id: item.id,
    title: item.title,
    typeContent: item.typeContent,
    imageUrl: item.imageUrl
      ? `https://${process.env.R2_PUBLIC_DOMAIN}/${item.imageUrl}`
      : undefined,
    viewCount: item.viewCount,
    copyCount: item.copyCount,
    tier: item.tier,
    createdAt: item.createdAt ? item.createdAt.toISOString() : '',
    categoryName: item.categoryName || undefined,
    authorName: item.authorName || 'Unknown',
  }));

  const categoriesData = await db
    .select({
      label: categoryComponents.name,
      value: categoryComponents.id,
    })
    .from(categoryComponents);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Components</h1>
        <Link href="/dashboard/content/components/create">
          <Button>+ New Component</Button>
        </Link>
      </div>
      <ComponentsClient
        data={components}
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
