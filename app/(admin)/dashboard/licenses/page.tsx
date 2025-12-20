import ListLicenses, { SearchParamsProps } from '@/modules/dashboard/licenses/list-page';
import { Suspense } from 'react';
import { DashboardListSkeleton } from '@/components/skeletons/dashboard-list-skeleton';

export default function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>;
}) {
  return (
    <Suspense fallback={<DashboardListSkeleton />}>
      <ListLicensesWrapper searchParams={searchParams} />
    </Suspense>
  );
}

async function ListLicensesWrapper({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>;
}) {
  const resolvedSearchParams = await searchParams;
  return <ListLicenses searchParams={resolvedSearchParams} />;
}
