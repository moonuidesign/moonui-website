import ListComponent from '@/modules/dashboard/components/list-page';
import { Suspense } from 'react';
import { DashboardListSkeleton } from '@/components/skeletons/dashboard-list-skeleton';

export const dynamic = 'force-dynamic';
export type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  return (
    <Suspense fallback={<DashboardListSkeleton />}>
      <ListComponent searchParams={searchParams} />
    </Suspense>
  );
}
