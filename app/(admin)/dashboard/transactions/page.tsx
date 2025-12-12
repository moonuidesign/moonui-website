import ListTransactions, { SearchParamsProps } from '@/modules/dashboard/transactions/list-page';
import { Suspense } from 'react';

export default function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListTransactionsWrapper searchParams={searchParams} />
    </Suspense>
  );
}

async function ListTransactionsWrapper({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>;
}) {
  const resolvedSearchParams = await searchParams;
  return <ListTransactions searchParams={resolvedSearchParams} />;
}
