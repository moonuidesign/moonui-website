import ListTemplate from '@/modules/dashboard/templates/list-page';

export type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  return <ListTemplate searchParams={searchParams} />;
}
