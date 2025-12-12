import EditTemplate from '@/modules/dashboard/templates/edit-page';
interface EditComponentPageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: EditComponentPageProps) {
  return <EditTemplate id={params.id} />;
}
