import { getCategoryComponents } from '@/server-action/getCategoryComponent';
import { db } from '@/libs/drizzle';
import { contentComponents } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ComponentEntity } from '@/components';
import ComponentForm from '@/components/dashboard/components/component-form';

export default async function EditComponent({ id }: { id: string }) {
  const data = await db
    .select()
    .from(contentComponents)
    .where(eq(contentComponents.id, id))
    .limit(1);

  const componentRaw = data[0];

  if (!componentRaw) {
    notFound();
  }

  const categories = await getCategoryComponents();

  const formattedComponent = {
    ...componentRaw,
    copyComponentTextHTML: (componentRaw.copyComponentTextHTML as any)
      ?.content as string,
    copyComponentTextPlain: (componentRaw.copyComponentTextPlain as any)
      ?.content as string,
    statusContent:
      componentRaw.statusContent as ComponentEntity['statusContent'],
    imageUrl: componentRaw.imageUrl
      ? `https://${process.env.R2_PUBLIC_DOMAIN}/${componentRaw.imageUrl}`
      : null,
    rawHTMLInput: componentRaw.codeSnippets?.html,
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <ComponentForm component={formattedComponent} categories={categories} />
    </div>
  );
}
