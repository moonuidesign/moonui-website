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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Eye, Download, MoreHorizontal, Trash, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DashboardPagination } from '@/components/dashboard/dashboard-pagination';
import { toast } from 'react-toastify';
import { deleteContentTemplate } from '@/server-action/templates/deleteTemplate';

interface images {
  url: string;
}
export interface TemplateItem {
  id: string;
  title: string;
  images: images[];
  typeContent: string;
  tier: string;
  statusContent: string;
  viewCount: number;
  downloadCount: number | null;
  createdAt: string;
  categoryName?: string;
  authorName?: string;
}

interface TemplatesClientProps {
  data: TemplateItem[];
  categories: { label: string; value: string }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  isSuperAdmin?: boolean;
}

export default function TemplatesClient({
  data,
  categories,
  pagination,
  isSuperAdmin,
}: TemplatesClientProps) {
  const [view, setView] = useState<'table' | 'card'>('table');
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      startTransition(async () => {
        const res = await deleteContentTemplate(id);
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>

                <TableHead>Type</TableHead>
                <TableHead>Tier</TableHead>
                {isSuperAdmin && <TableHead>Author</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isSuperAdmin ? 10 : 9} className="h-24 text-center">
                    No templates found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.images ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-100">
                          <Image
                            src={item.images[0]?.url}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-200" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.categoryName || '-'}</TableCell>

                    <TableCell className="capitalize">{item.typeContent}</TableCell>
                    <TableCell className="capitalize">{item.tier.replace('_', ' ')}</TableCell>
                    {isSuperAdmin && (
                      <TableCell className="text-muted-foreground text-xs">
                        {item.authorName || 'Unknown'}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant={item.statusContent === 'published' ? 'default' : 'secondary'}>
                        {item.statusContent}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" /> {item.downloadCount || 0}
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
                          <Link href={`/dashboard/content/templates/edit/${item.id}`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/templates/${item.id}`} target="_blank">
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
              No templates found.
            </div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="group relative">
                <ResourceCard
                  id={item.id}
                  title={item.title}
                  imageUrl={item.images[0].url}
                  tier={item.tier}
                  createdAt={new Date(item.createdAt)}
                  className="w-full"
                />
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
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <Link href={`/dashboard/content/templates/edit/${item.id}`}>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> Edit
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
