import { Suspense } from 'react';
import CategoryCreatePage from '@/modules/dashboard/categories/category-create-page';
import { listCategories } from '@/server-action/category/category-actions';
import { CategoryType } from '@/server-action/category/category-validator';
import { FormSkeleton } from '@/components/skeletons/form-skeleton';

const categoryType: CategoryType = 'components';

export default async function Page() {
  const result = await listCategories(categoryType, ''); // Get all categories for parent selection
  const availableParentCategories = result.success ? result.data : [];

  return (
    <Suspense fallback={<FormSkeleton />}>
      <CategoryCreatePage
        categoryType={categoryType}
        initialCategories={availableParentCategories || []}
      />
    </Suspense>
  );
}
