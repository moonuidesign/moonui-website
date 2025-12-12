import ComponentForm from '@/components/dashboard/components/component-form';
import { getCategoryComponents } from '@/server-action/getCategoryComponent';

export default async function CreateComponent() {
  const categories = await getCategoryComponents();

  return (
    <div>
      <ComponentForm categories={categories} />
    </div>
  );
}
