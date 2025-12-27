import { db } from '@/libs/drizzle';
import { discounts } from '@/db/migration';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { deleteDiscount } from '@/server-action/action-discount';
import { revalidatePath } from 'next/cache';

export default async function ListDiscount() {
    const data = await db
        .select()
        .from(discounts)
        .orderBy(desc(discounts.createdAt));

    return (
        <div className="flex flex-col gap-8 p-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-[28px] md:text-[30px] font-bold tracking-tight">
                        Discounts
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your discount codes and promotions here.
                    </p>
                </div>
                <Link href="/dashboard/discounts/create">
                    <Button size="lg" className="shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Discount
                    </Button>
                </Link>
            </div>

            {/* Table Section */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Discount (%)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No discounts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        <code className="bg-muted px-2 py-1 rounded text-sm font-semibold">
                                            {item.code}
                                        </code>
                                    </TableCell>
                                    <TableCell>{item.discount}%</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${item.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {item.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/dashboard/discounts/${item.id}/edit`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <form
                                                action={async () => {
                                                    'use server';
                                                    await deleteDiscount(item.id);
                                                }}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </form>
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
