import ListDesign from '@/modules/dashboard/designs/list-page';
import { Suspense } from 'react';
import { DashboardListSkeleton } from '@/components/skeletons/dashboard-list-skeleton';

export type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  return (
    <Suspense fallback={<DashboardListSkeleton />}>
      <ListDesign searchParams={searchParams} />
    </Suspense>
  );
}
