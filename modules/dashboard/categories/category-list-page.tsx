import { db } from '@/libs/drizzle';
import {
  categoryDesigns,
  categoryComponents,
  categoryTemplates,
  categoryGradients,
} from '@/db/migration';
import { desc, asc, eq, ilike, and, sql } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CategoriesClient, {
  CategoryItem,
} from '@/components/dashboard/category/client';
import { CategoryType } from '@/server-action/category/category-validator';
import { alias } from 'drizzle-orm/pg-core';

// --- Helper: Table Selection ---
function getCategoryTable(categoryType: CategoryType) {
  switch (categoryType) {
    case 'components':
      return categoryComponents;
    case 'design':
      return categoryDesigns;
    case 'templates':
      return categoryTemplates;
    case 'gradients':
      return categoryGradients;
    default:
      throw new Error('Invalid category type');
  }
}

interface CategoryListPageProps {
  categoryType: CategoryType;
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function CategoryListPage({
  categoryType,
  searchParams,
}: CategoryListPageProps) {
  // Await searchParams for Next.js 15 compatibility
  const params = await searchParams;

  const search = typeof params?.search === 'string' ? params.search : undefined;
  const categoryId =
    typeof params?.categoryId === 'string' ? params.categoryId : undefined;
  const sort =
    typeof params?.sort === 'string' ? params.sort : 'createdAt.desc';
  const page = typeof params?.page === 'string' ? parseInt(params.page) : 1;

  const ITEMS_PER_PAGE = 10;
  const limit = ITEMS_PER_PAGE;
  const offset = (page - 1) * limit;

  // --- 1. Identify Table ---
  const table = getCategoryTable(categoryType);
  const parentTable = alias(table, 'parent_table');

  // --- 2. Build Filters ---
  const filters = [];
  if (search) filters.push(ilike(table.name, `%${search}%`));
  if (categoryId && categoryId !== 'all')
    filters.push(eq(table.parentId, categoryId));

  // --- 3. Build Sort ---
  let orderBy = desc(table.createdAt);
  if (sort === 'createdAt.asc') orderBy = asc(table.createdAt);
  else if (sort === 'name.asc') orderBy = asc(table.name);
  else if (sort === 'name.desc') orderBy = desc(table.name);

  // --- 4. Fetch Data ---
  const data = await db
    .select({
      id: table.id,
      name: table.name,
      imageUrl: table.imageUrl,
      parentId: table.parentId,
      parentName: parentTable.name,
      createdAt: table.createdAt,
    })
    .from(table)
    .leftJoin(parentTable, eq(table.parentId, parentTable.id))
    .where(and(...filters))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // --- 5. Fetch Total Count ---
  const totalItemsResult = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(table)
    .where(and(...filters));

  const totalItems = Number(totalItemsResult[0]?.count || 0);
  const totalPages = Math.ceil(totalItems / limit);

  // --- 6. Fetch Potential Parents (for filter) ---
  const allCategories = await db
    .select({
      id: table.id,
      name: table.name,
    })
    .from(table)
    .orderBy(asc(table.name));

  const parentOptions = allCategories.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  // --- 7. Map Data ---
  const formattedCategories: CategoryItem[] = data.map((item) => ({
    id: item.id,
    name: item.name,
    imageUrl: item.imageUrl,
    parentId: item.parentId,
    parentName: item.parentName,
    createdAt: item.createdAt ? item.createdAt.toISOString() : null,
  }));

  const pathSegment = categoryType === 'design' ? 'designs' : categoryType;
  const basePath = `/dashboard/category/${pathSegment}`;

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-[28px] md:text-[30px] font-bold tracking-tight capitalize">
            {categoryType} Categories
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your {categoryType} categories structure.
          </p>
        </div>
        <Button asChild size="lg" className="shadow-sm">
          <Link href={`${basePath}/create`}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
          </Link>
        </Button>
      </div>

      <CategoriesClient
        data={formattedCategories}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        }}
        categoryType={categoryType}
        basePath={basePath}
        parents={parentOptions}
      />
    </div>
  );
}
