import { getCategoriesWithSubCategories } from '@/server-action/getCategoryComponent';
import { ComponentForm } from '../../../../../../components/EditComponentForm';

export default async function Home() {
  const categories = await getCategoriesWithSubCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tambah Komponen Baru</h1>
      <ComponentForm categories={categories} />
    </div>
  );
}
