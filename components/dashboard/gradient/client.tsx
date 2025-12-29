'use client';

import { useState, useTransition } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Download, Eye, MoreHorizontal, Trash, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DashboardPagination } from '@/components/dashboard/dashboard-pagination';
import { toast } from 'react-toastify';
import { deleteContentGradient } from '@/server-action/gradients/deleteGradient';

export interface GradientItem {
  id: string;
  name: string;
  image: string;
  typeGradient: string;
  tier: string;
  downloadCount: number | null;
  viewCount: number | null;
  createdAt: string;
  categoryName?: string;
  authorName?: string;
}

interface GradientsClientProps {
  data: GradientItem[];
  categories: { label: string; value: string }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  isSuperAdmin?: boolean;
}

export default function GradientsClient({
  data,
  categories,
  pagination,
  isSuperAdmin,
}: GradientsClientProps) {
  const [view, setView] = useState<'table' | 'card'>('table');
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this gradient? This action cannot be undone.')) {
      startTransition(async () => {
        const res = await deleteContentGradient(id);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.success);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <ContentToolbar
        view={view}
        setView={setView}
        categories={categories}
        tiers={[
          { label: 'Free', value: 'free' },
          { label: 'Pro', value: 'pro' },
        ]}
        sortOptions={[
          { label: 'Newest', value: 'createdAt.desc' },
          { label: 'Oldest', value: 'createdAt.asc' },
          { label: 'A-Z', value: 'title.asc' },
          { label: 'Z-A', value: 'title.desc' },
          { label: 'Best Download', value: 'downloadCount.desc' },
        ]}
      />

      {view === 'table' ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tier</TableHead>
                {isSuperAdmin && <TableHead>Author</TableHead>}
                <TableHead>Downloads</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isSuperAdmin ? 9 : 8} className="h-24 text-center">
                    No gradients found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.image ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-100">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-200" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.categoryName || '-'}</TableCell>
                    <TableCell className="capitalize">{item.typeGradient}</TableCell>
                    <TableCell className="capitalize">{item.tier}</TableCell>
                    {isSuperAdmin && (
                      <TableCell className="text-muted-foreground text-xs">
                        {item.authorName || 'Unknown'}
                      </TableCell>
                    )}
                    <TableCell className="text-muted-foreground text-xs">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" /> {item.downloadCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {item.viewCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <Link href={`/dashboard/content/gradients/edit/${item.id}`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/gradients/${item.id}`} target="_blank">
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" /> View Public
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive focus:text-destructive"
                            disabled={isPending}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.length === 0 ? (
            <div className="text-muted-foreground col-span-full py-12 text-center">
              No gradients found.
            </div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="group relative">
                <ResourceCard
                  id={item.id}
                  title={item.name}
                  imageUrl={item.image}
                  tier={item.tier}
                  createdAt={new Date(item.createdAt)}
                  className="w-full"
                />
                {/* Author badge for card view if superadmin */}
                {isSuperAdmin && item.authorName && (
                  <div className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                    {item.authorName}
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="secondary" className="h-8 w-8 shadow-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/dashboard/content/gradients/edit/${item.id}`}>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
