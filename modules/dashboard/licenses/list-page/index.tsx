import { db } from '@/libs/drizzle';
import { licenses, users } from '@/db/migration';
import { desc, asc, eq, ilike, and, sql } from 'drizzle-orm';
import LicensesClient from '@/components/dashboard/licenses/client';

export type SearchParamsProps = {
  [key: string]: string | string[] | undefined;
};

const ITEMS_PER_PAGE = 10;

export default async function ListLicenses({
  searchParams,
}: {
  searchParams: SearchParamsProps;
}) {
  const search =
    typeof searchParams?.search === 'string' ? searchParams.search : undefined;
  const page =
    typeof searchParams?.page === 'string' ? parseInt(searchParams.page) : 1;
  const sort =
    typeof searchParams?.sort === 'string'
      ? searchParams.sort
      : 'createdAt.desc';

  const limit = ITEMS_PER_PAGE;
  const offset = (page - 1) * limit;

  // Build Filters
  const filters = [];
  if (search) {
    // Search by license key or user email
    // Since we are joining, we can't easily OR across tables with the current simplified filter logic
    // But we can filter by license key easily. 
    // For email, it depends on how we structure the query.
    // Let's stick to license key for now, or try to be smart.
    filters.push(ilike(licenses.licenseKey, `%${search}%`));
  }

  // Build Sort
  let orderBy = desc(licenses.createdAt);
  if (sort === 'createdAt.asc') orderBy = asc(licenses.createdAt);

  // Fetch paginated data
  const data = await db
    .select({
      id: licenses.id,
      licenseKey: licenses.licenseKey,
      status: licenses.status,
      planType: licenses.planType,
      tier: licenses.tier,
      expiresAt: licenses.expiresAt,
      createdAt: licenses.createdAt,
      userEmail: users.email,
    })
    .from(licenses)
    .leftJoin(users, eq(licenses.userId, users.id))
    .where(and(...filters))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Fetch total count
  const totalItemsResult = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(licenses)
    .where(and(...filters));

  const totalItems = totalItemsResult[0]?.count || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const formattedData = data.map((item) => ({
    id: item.id,
    licenseKey: item.licenseKey,
    userEmail: item.userEmail || 'Unknown',
    status: item.status,
    planType: item.planType,
    tier: item.tier,
    expiresAt: item.expiresAt ? item.expiresAt.toISOString() : null,
    createdAt: item.createdAt ? item.createdAt.toISOString() : '',
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Licenses</h1>
      </div>
      <LicensesClient
        data={formattedData}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        }}
      />
    </div>
  );
}
