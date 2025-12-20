import GradientForm from '@/components/dashboard/gradient/gradient-form';
import { getCategoryGradients } from '@/server-action/getCategoryComponent';
import { Suspense } from 'react';
import { FormSkeleton } from '@/components/skeletons/form-skeleton';

export default function CreateTemplatePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <CreateGradientContent />
    </Suspense>
  );
}

async function CreateGradientContent() {
  const categories = await getCategoryGradients();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tambah Gradient Baru</h1>
      <GradientForm categories={categories} />
    </div>
  );
}
