import GradientForm from '@/components/dashboard/gradient/gradient-form';
import { getCategoryGradients } from '@/server-action/getCategoryComponent';

export default async function CreateTemplatePage() {
  const categories = await getCategoryGradients();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tambah Gradient Baru</h1>
      <GradientForm categories={categories} />
    </div>
  );
}
