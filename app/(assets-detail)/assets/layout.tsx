import DetailAssetsLayout from '@/components/general/layout/detail-assets';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DetailAssetsLayout>{children}</DetailAssetsLayout>;
}
