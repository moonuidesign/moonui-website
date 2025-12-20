import { SearchParamsProps } from '@/modules';
import ListTransactions from '@/modules/dashboard/transactions/list-page';

export async function ListTransactionsWrapper({
  searchParams,
}: {
  searchParams: SearchParamsProps;
}) {
  return <ListTransactions searchParams={searchParams} />;
}
