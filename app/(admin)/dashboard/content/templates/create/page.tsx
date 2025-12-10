import { getCategoriesWithSubCategories } from '@/server-action/getCategoryComponent';
import { TemplateForm } from '../TemplateForm';

export default async function CreateTemplatePage() {
  const categories = await getCategoriesWithSubCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tambah Template Baru</h1>
      <TemplateForm categories={categories} />
    </div>
  );
}
