import GradientForm from '@/components/dashboard/gradient/gradient-form';
import { getCategoryGradients } from '@/server-action/getCategoryComponent';

export default async function CreateGradient() {
  const categories = await getCategoryGradients();

  return (
    <div>
      <GradientForm categories={categories} />
    </div>
  );
}
