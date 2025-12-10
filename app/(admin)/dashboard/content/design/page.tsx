import { db } from '@/libs/drizzle';
import { contentDesigns, categoryDesigns } from '@/db/migration/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default async function DesignsPage() {
  const data = await db
    .select({
      id: contentDesigns.id,
      title: contentDesigns.title,
      imageUrl: contentDesigns.imageUrl,
      tier: contentDesigns.tier,
      statusContent: contentDesigns.statusContent,
      createdAt: contentDesigns.createdAt,
      category: {
        name: categoryDesigns.name,
      },
    })
    .from(contentDesigns)
    .leftJoin(
      categoryDesigns,
      eq(contentDesigns.categoryDesignsId, categoryDesigns.id),
    )
    .orderBy(desc(contentDesigns.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Designs</h1>
        <Link href="/dashboard/content/design/create">
          <Button>+ New Design</Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No designs found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.imageUrl ? (
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-200" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.category?.name || '-'}</TableCell>
                  <TableCell className="capitalize">
                    {item.tier.replace('_', ' ')}
                  </TableCell>
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
                      <Link href={`/dashboard/content/design/edit/${item.id}`}>
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
    </div>
  );
}