import { getCategoriesWithSubCategories } from '@/server-action/getCategoryComponent';
import { DesignForm } from '../DesignForm';

export default async function CreateDesignPage() {
  const categories = await getCategoriesWithSubCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tambah Design Baru</h1>
      <DesignForm categories={categories} />
    </div>
  );
}
