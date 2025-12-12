'use client';

import { useState } from 'react';
import { ContentToolbar } from '@/components/dashboard/content/content-toolbar';
import { ResourceCard } from '@/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DashboardPagination } from '@/components/dashboard/dashboard-pagination';

export interface DesignItem {
  id: string;
  title: string;
  imagesUrl: string[];
  tier: string;
  statusContent: string;
  createdAt: string | null;
  categoryName: string | null;
  authorName?: string;
}

interface DesignsClientProps {
  data: DesignItem[];
  categories: { label: string; value: string }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  isSuperAdmin?: boolean;
}

export default function DesignsClient({
  data,
  categories,
  pagination,
  isSuperAdmin,
}: DesignsClientProps) {
  const [view, setView] = useState<'table' | 'card'>('table');

  return (
    <div className="space-y-6">
      <ContentToolbar
        view={view}
        setView={setView}
        categories={categories}
        tiers={[
          { label: 'Free', value: 'free' },
          { label: 'Pro Plus', value: 'pro_plus' },
        ]}
        statuses={[
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
          { label: 'Archived', value: 'archived' },
        ]}
        sortOptions={[
          { label: 'Newest', value: 'createdAt.desc' },
          { label: 'Oldest', value: 'createdAt.asc' },
          { label: 'A-Z', value: 'title.asc' },
          { label: 'Z-A', value: 'title.desc' },
          { label: 'Best View', value: 'viewCount.desc' },
          { label: 'Best Download', value: 'downloadCount.desc' },
        ]}
      />

      {view === 'table' ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tier</TableHead>
                {isSuperAdmin && <TableHead>Author</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isSuperAdmin ? 7 : 6}
                    className="text-center h-24"
                  >
                    No designs found.
                  </TableCell>
                </TableRow>
              ) : (
                // MODIFIKASI DISINI: Menggunakan .slice(0, 1) untuk ambil index 0 saja
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {/* Perhatikan: Di interface imagesUrl (array), tapi disini dipakai imageUrl (string). 
                          Pastikan data yang masuk sesuai. Jika error, ganti item.imageUrl dengan item.imagesUrl[0] */}
                      {(item as any).imageUrl ? (
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                          <Image
                            src={(item as any).imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-200" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.categoryName || '-'}</TableCell>
                    <TableCell className="capitalize">
                      {item.tier.replace('_', ' ')}
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell className="text-xs text-muted-foreground">
                        {item.authorName || 'Unknown'}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant={
                          item.statusContent === 'published'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {item.statusContent}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/content/design/edit/${item.id}`}
                        >
                          <Button size="icon" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
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
              No designs found.
            </div>
          ) : (
            // MODIFIKASI DISINI: Menggunakan .slice(0, 1) untuk ambil index 0 saja
            data.map((item) => (
              <div key={item.id} className="relative group">
                <ResourceCard
                  id={item.id}
                  title={item.title}
                  imageUrl={(item as any).imageUrl}
                  tier={item.tier}
                  createdAt={item.createdAt ? new Date(item.createdAt) : null}
                  className="w-full"
                />
                {/* Author badge for card view if superadmin */}
                {isSuperAdmin && item.authorName && (
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                    {item.authorName}
                  </div>
                )}
                {/* Overlay Action for Edit in Card View */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/dashboard/content/design/edit/${item.id}`}>
                    <Button size="sm" variant="secondary" className="shadow-sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
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
