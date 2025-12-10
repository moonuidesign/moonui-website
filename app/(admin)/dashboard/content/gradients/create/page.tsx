import { getCategoriesWithSubCategories } from '@/server-action/getCategoryComponent';
import { GradientForm } from '@/components/gradient-form/gradient-form';

export default async function CreateTemplatePage() {
  const categories = await getCategoriesWithSubCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tambah Template Baru</h1>
      <GradientForm categories={categories} />
    </div>
  );
}
