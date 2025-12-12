import ListComponent from '@/modules/dashboard/components/list-page';

export type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  return <ListComponent searchParams={searchParams} />;
}
