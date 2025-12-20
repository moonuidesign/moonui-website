import CreateComponent from '@/modules/dashboard/components/create-page';
import { Suspense } from 'react';
import { FormSkeleton } from '@/components/skeletons/form-skeleton';

export default async function Page() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <CreateComponent />
    </Suspense>
  );
}
