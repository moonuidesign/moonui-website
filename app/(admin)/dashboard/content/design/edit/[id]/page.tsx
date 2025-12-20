import EditDesign from '@/modules/dashboard/designs/edit-page';
import { Suspense } from 'react';
import { FormSkeleton } from '@/components/skeletons/form-skeleton';
import { EditComponentPageProps } from '../../../templates/edit/[id]/page';

export default async function page({ params }: EditComponentPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditDesign id={id} />
    </Suspense>
  );
}
