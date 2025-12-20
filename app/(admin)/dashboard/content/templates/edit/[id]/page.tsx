// app/dashboard/templates/[id]/page.tsx (or wherever this file is)

import EditTemplate from '@/modules/dashboard/templates/edit-page';
import { Suspense } from 'react';
import { FormSkeleton } from '@/components/skeletons/form-skeleton';

export interface EditComponentPageProps {
  // In Next.js 15, params is a Promise!
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: EditComponentPageProps) {
  // 1. Await the params before accessing properties
  const { id } = await params;

  return (
    <Suspense fallback={<FormSkeleton />}>
      {/* 2. Pass the resolved ID */}
      <EditTemplate id={id} />
    </Suspense>
  );
}
