import ListDesign from '@/modules/dashboard/designs/list-page';

export type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  return <ListDesign searchParams={searchParams} />;
}
