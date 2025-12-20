import EditGradient from '@/modules/dashboard/gradients/edit-page';
import { Suspense } from 'react';
import { FormSkeleton } from '@/components/skeletons/form-skeleton';

// 1. Ubah tipe params menjadi Promise
interface EditComponentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page(props: EditComponentPageProps) {
  // 2. Await params terlebih dahulu
  const params = await props.params;

  // 3. Sekarang ID sudah aman untuk dikirim
  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditGradient id={params.id} />
    </Suspense>
  );
}
