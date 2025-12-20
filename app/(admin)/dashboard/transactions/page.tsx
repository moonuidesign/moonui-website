import { SearchParamsProps } from '@/modules/dashboard/transactions/list-page';
import { Suspense } from 'react';
import { ListTransactionsWrapper } from './wraper';
import { DashboardListSkeleton } from '@/components/skeletons/dashboard-list-skeleton';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>;
}) {
  const searchParamsS = await searchParams;
  return (
    <Suspense fallback={<DashboardListSkeleton />}>
      <ListTransactionsWrapper searchParams={searchParamsS} />
    </Suspense>
  );
}
