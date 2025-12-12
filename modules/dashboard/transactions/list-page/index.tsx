import { db } from '@/libs/drizzle';
import { licenseTransactions, users } from '@/db/migration';
import { desc, asc, eq, and, sql, SQL } from 'drizzle-orm';
import TransactionsClient from '@/components/dashboard/transactions/client';

export type SearchParamsProps = {
  [key: string]: string | string[] | undefined;
};

const ITEMS_PER_PAGE = 10;

export default async function ListTransactions({
  searchParams,
}: {
  searchParams: SearchParamsProps;
}) {
  const page =
    typeof searchParams?.page === 'string' ? parseInt(searchParams.page) : 1;
  const sort =
    typeof searchParams?.sort === 'string'
      ? searchParams.sort
      : 'createdAt.desc';

  const limit = ITEMS_PER_PAGE;
  const offset = (page - 1) * limit;

  // Build Filters
  const filters: SQL[] = [];
  // Add search filters later if needed

  // Build Sort
  let orderBy = desc(licenseTransactions.createdAt);
  if (sort === 'createdAt.asc') orderBy = asc(licenseTransactions.createdAt);

  // Fetch paginated data
  const data = await db
    .select({
      id: licenseTransactions.id,
      transactionType: licenseTransactions.transactionType,
      amount: licenseTransactions.amount,
      status: licenseTransactions.status,
      createdAt: licenseTransactions.createdAt,
      userEmail: users.email,
    })
    .from(licenseTransactions)
    .leftJoin(users, eq(licenseTransactions.userId, users.id))
    .where(and(...filters))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Fetch total count
  const totalItemsResult = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(licenseTransactions)
    .where(and(...filters));

  const totalItems = totalItemsResult[0]?.count || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const formattedData = data.map((item) => ({
    id: item.id,
    userEmail: item.userEmail || 'Unknown',
    transactionType: item.transactionType,
    amount: item.amount,
    status: item.status,
    createdAt: item.createdAt ? item.createdAt.toISOString() : '',
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transactions</h1>
      </div>
      <TransactionsClient
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
