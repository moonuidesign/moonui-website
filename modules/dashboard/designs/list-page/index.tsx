import { db } from '@/libs/drizzle';
import { contentDesigns, categoryDesigns, users } from '@/db/migration';
import { desc, asc, eq, ilike, and, sql } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react'; // Icon tambahan
import { SearchParamsProps } from '../../components';
import DesignsClient from '@/components/dashboard/design/client';
import { auth } from '@/libs/auth';

export default async function ListDesign({
  searchParams,
}: {
  searchParams: SearchParamsProps;
}) {
  const session = await auth();
  const role = session?.user?.roleUser;
  const userId = session?.user?.id;

  // Await searchParams jika menggunakan Next.js 15, aman untuk versi 14 juga
  const params = await searchParams;

  const search = typeof params?.search === 'string' ? params.search : undefined;
  const categoryId =
    typeof params?.categoryId === 'string' ? params.categoryId : undefined;
  const tier = typeof params?.tier === 'string' ? params.tier : undefined;
  const status = typeof params?.status === 'string' ? params.status : undefined;
  const sort =
    typeof params?.sort === 'string' ? params.sort : 'createdAt.desc';
  const page = typeof params?.page === 'string' ? parseInt(params.page) : 1;

  const ITEMS_PER_PAGE = 10;
  const limit = ITEMS_PER_PAGE;
  const offset = (page - 1) * limit;

  // --- 1. Build Filters ---
  const filters = [];
  if (search) filters.push(ilike(contentDesigns.title, `%${search}%`));
  if (categoryId && categoryId !== 'all')
    filters.push(eq(contentDesigns.categoryDesignsId, categoryId));
  if (tier && tier !== 'all')
    filters.push(eq(contentDesigns.tier, tier as any));
  if (status && status !== 'all')
    filters.push(eq(contentDesigns.statusContent, status));
  
  if (role === 'admin' && userId) {
    filters.push(eq(contentDesigns.userId, userId));
  }

  // --- 2. Build Sort ---
  let orderBy = desc(contentDesigns.createdAt);
  if (sort === 'createdAt.asc') orderBy = asc(contentDesigns.createdAt);
  else if (sort === 'title.asc') orderBy = asc(contentDesigns.title);
  else if (sort === 'title.desc') orderBy = desc(contentDesigns.title);
  else if (sort === 'viewCount.desc') orderBy = desc(contentDesigns.viewCount);
  else if (sort === 'downloadCount.desc') orderBy = desc(contentDesigns.downloadCount);

  // --- 3. Fetch Data ---
  const data = await db
    .select({
      id: contentDesigns.id,
      title: contentDesigns.title,
      imagesUrl: contentDesigns.imagesUrl, // Ini JSONB
      tier: contentDesigns.tier,
      statusContent: contentDesigns.statusContent,
      createdAt: contentDesigns.createdAt,
      categoryName: categoryDesigns.name,
      authorName: users.name,
    })
    .from(contentDesigns)
    .leftJoin(
      categoryDesigns,
      eq(contentDesigns.categoryDesignsId, categoryDesigns.id),
    )
    .leftJoin(users, eq(contentDesigns.userId, users.id))
    .where(and(...filters))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // --- 4. Fetch Total Count ---
  const totalItemsResult = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(contentDesigns)
    .leftJoin(
      categoryDesigns,
      eq(contentDesigns.categoryDesignsId, categoryDesigns.id),
    )
    .where(and(...filters));

  const totalItems = Number(totalItemsResult[0]?.count || 0);
  const totalPages = Math.ceil(totalItems / limit);

  // --- 5. Fetch Categories for Filter ---
  const categoriesData = await db
    .select({
      label: categoryDesigns.name,
      value: categoryDesigns.id,
    })
    .from(categoryDesigns);

  // --- 6. Data Mapping & Cleaning (CRITICAL STEP) ---
  const designs = data.map((item) => {
    // Casting JSONB ke string array
    const images = (item.imagesUrl as string[]) || [];
    // Ambil gambar pertama untuk thumbnail, atau null jika kosong
    const firstImage = images.length > 0 ? images[0] : null;

    return {
      id: item.id,
      title: item.title,
      // Kirim 'imageUrl' string tunggal untuk ditampilkan di Table/Card
      imageUrl: firstImage,
      // Kirim array asli jika Client butuh (misal untuk carousel)
      imagesUrl: images,
      tier: item.tier,
      statusContent: item.statusContent,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      categoryName: item.categoryName || 'Uncategorized',
      authorName: item.authorName || 'Unknown',
    };
  });

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header Section yang Lebih Menarik */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design Library</h1>
          <p className="text-muted-foreground mt-1">
            Manage your design assets, figma files, and templates here.
          </p>
        </div>
        <Link href="/dashboard/content/design/create">
          <Button size="lg" className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Create New Design
          </Button>
        </Link>
      </div>

      {/* Client Component */}
      <DesignsClient
        data={designs}
        categories={categoriesData}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        }}
        isSuperAdmin={role === 'superadmin'}
      />
    </div>
  );
}
