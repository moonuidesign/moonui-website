'use client';

import { useState } from 'react';
import { ContentToolbar } from '@/components/dashboard/content/content-toolbar';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DashboardPagination } from '@/components/dashboard/dashboard-pagination';
import { CategoryType } from '@/server-action/category/category-validator';
import { deleteCategory } from '@/server-action/category/category-actions';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export interface CategoryItem {
  id: string;
  name: string;
  imageUrl?: string | null;
  parentId?: string | null;
  parentName?: string | null;
  createdAt: string | null;
  _count?: {
    children: number;
  };
}

interface CategoriesClientProps {
  data: CategoryItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  categoryType: CategoryType;
  basePath: string;
  parents?: { label: string; value: string }[];
}

export default function CategoriesClient({
  data,
  pagination,
  categoryType,
  basePath,
  parents = [],
}: CategoriesClientProps) {
  const [view, setView] = useState<'table' | 'card'>('table');
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await deleteCategory(categoryType, id);
      if (res.success) {
        toast.success('Category deleted successfully');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to delete category');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <ContentToolbar
        view={view}
        setView={setView}
        categories={parents}
        sortOptions={[
          { label: 'Newest', value: 'createdAt.desc' },
          { label: 'Oldest', value: 'createdAt.asc' },
          { label: 'A-Z', value: 'name.asc' },
          { label: 'Z-A', value: 'name.desc' },
        ]}
      />

      {view === 'table' ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Parent Category</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-24"
                  >
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.imageUrl ? (
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 border">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 border flex items-center justify-center text-xs text-muted-foreground">
                          No Img
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.parentName || '-'}</TableCell>
                    <TableCell>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`${basePath}/edit/${item.id}`}
                        >
                          <Button size="icon" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No categories found.
            </div>
          ) : (
            data.map((item) => (
              <Card key={item.id} className="relative group overflow-hidden">
                 <CardContent className="flex flex-col items-center justify-center p-6 pt-8">
                {item.imageUrl ? (
                  <div className="mb-4 relative w-24 h-24 rounded-full overflow-hidden border">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-4 relative w-24 h-24 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">
                      No Image
                    </span>
                  </div>
                )}
                <CardTitle className="text-lg text-center">
                  {item.name}
                </CardTitle>
                {item.parentName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Sub: {item.parentName}
                  </p>
                )}
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Link
                      href={`${basePath}/edit/${item.id}`}
                    >
                    <Button size="icon" variant="secondary" className="h-8 w-8 shadow-sm">
                        <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                   <Button 
                      size="icon" 
                      variant="destructive" 
                      className="h-8 w-8 shadow-sm"
                      onClick={() => handleDelete(item.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <DashboardPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
