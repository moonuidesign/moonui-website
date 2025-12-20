import { Suspense } from 'react';
import CategoryListPage from '@/modules/dashboard/categories/category-list-page';
import { CategoryType } from '@/server-action/category/category-validator';
import { FormSkeleton } from '@/components/skeletons/form-skeleton';

const categoryType: CategoryType = 'components';
export type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  return (
    <Suspense fallback={<FormSkeleton />}>
      <CategoryListPage
        categoryType={categoryType}
        searchParams={searchParams}
      />
    </Suspense>
  );
}
