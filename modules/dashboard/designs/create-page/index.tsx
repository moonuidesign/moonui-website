import DesignForm from '@/components/dashboard/design/design-form';
import { getCategoryDesigns } from '@/server-action/getCategoryComponent';

export default async function CreateDesign() {
  const categories = await getCategoryDesigns();

  return (
    <div>
      <DesignForm categories={categories} />
    </div>
  );
}
