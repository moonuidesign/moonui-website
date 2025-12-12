import EditGradient from '@/modules/dashboard/gradients/edit-page';

// 1. Ubah tipe params menjadi Promise
interface EditComponentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page(props: EditComponentPageProps) {
  // 2. Await params terlebih dahulu
  const params = await props.params;

  // 3. Sekarang ID sudah aman untuk dikirim
  return <EditGradient id={params.id} />;
}
