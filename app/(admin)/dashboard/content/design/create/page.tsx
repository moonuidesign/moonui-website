import CreateDesign from '@/modules/dashboard/designs/create-page';
import { Suspense } from 'react';
import { FormSkeleton } from '@/components/skeletons/form-skeleton';

export default async function CreatePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <CreateDesign />
    </Suspense>
  );
}
