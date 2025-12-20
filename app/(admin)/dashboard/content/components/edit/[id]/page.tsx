import EditComponent from '@/modules/dashboard/components/edit-page';
import { Suspense } from 'react';
import { FormSkeleton } from '@/components/skeletons/form-skeleton';
import { EditComponentPageProps } from '../../../templates/edit/[id]/page';

export default async function Page({ params }: EditComponentPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditComponent id={id} />
    </Suspense>
  );
}
