import TemplateForm from '@/components/dashboard/templates/template-form';
import { getCategoryTemplates } from '@/server-action/getCategoryComponent';

export default async function CreateTemplate() {
  const categories = await getCategoryTemplates();

  return (
    <div>
      <TemplateForm categories={categories} />
    </div>
  );
}
