import ListLicenses, { SearchParamsProps } from '@/modules/dashboard/licenses/list-page';
import { Suspense } from 'react';

export default function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
