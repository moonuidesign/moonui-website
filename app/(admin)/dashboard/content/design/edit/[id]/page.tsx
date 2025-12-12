import EditDesign from '@/modules/dashboard/designs/edit-page';

export default async function EditDesignPage({ id }: { id: string }) {
  return <EditDesign id={id} />;
}
