import { Suspense } from 'react';
import CategoryEditPage from '@/modules/dashboard/categories/category-edit-page';
import {
  getCategoryById,
  listCategories,
} from '@/server-action/category/category-actions';
import { CategoryType } from '@/server-action/category/category-validator';
import { FormSkeleton } from '@/components/skeletons/form-skeleton';
import { EditComponentPageProps } from '../../../../content/templates/edit/[id]/page';

const categoryType: CategoryType = 'templates';

export default async function Page({ params }: EditComponentPageProps) {
  const { id } = await params;

  const categoryResult = await getCategoryById(categoryType, id);
  const initialData = categoryResult.success ? categoryResult.data : null;

  const listResult = await listCategories(categoryType, ''); // Get all categories for parent selection
  const availableParentCategories = listResult.success ? listResult.data : [];

  return (
    <Suspense fallback={<FormSkeleton />}>
      <CategoryEditPage
        categoryType={categoryType}
        id={id}
        initialData={initialData}
        availableParentCategories={availableParentCategories || []}
      />
    </Suspense>
  );
}
