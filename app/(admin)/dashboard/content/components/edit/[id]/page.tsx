import EditComponent from '@/modules/dashboard/components/edit-page';
interface EditComponentPageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: EditComponentPageProps) {
  return <EditComponent id={params.id} />;
}
