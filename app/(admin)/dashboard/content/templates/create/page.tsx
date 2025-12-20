import CreateTemplate from '@/modules/dashboard/templates/create-page';
import { Suspense } from 'react';
import { FormSkeleton } from '@/components/skeletons/form-skeleton';

export default async function Page() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <CreateTemplate />
    </Suspense>
  );
}
