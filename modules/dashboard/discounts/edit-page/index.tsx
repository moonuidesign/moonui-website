'use client';

import { updateDiscount, getDiscountById } from '@/server-action/action-discount';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditDiscount({ id }: { id: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            const result = await getDiscountById(id);
            if (result.data) {
                setData(result.data);
            }
        }
        fetchData();
    }, [id]);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await updateDiscount(id, formData);
        setLoading(false);

        if ('error' in result) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
            router.push('/dashboard/discounts');
        }
    }

    if (!data) return <div>Loading...</div>;

    return (
        <div className="flex flex-col gap-8 p-8 max-w-2xl mx-auto w-full">
            <div className="flex flex-col gap-2">
                <Link
                    href="/dashboard/discounts"
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Discounts
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Edit Discount</h1>
                <p className="text-muted-foreground">
                    Update discount details.
                </p>
            </div>

            <form action={handleSubmit} className="space-y-6 border p-6 rounded-lg bg-white shadow-sm">
                <div className="space-y-2">
                    <Label htmlFor="name">Discount Name</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={data.name}
                        placeholder="e.g. Black Friday Sale"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Code</Label>
                        <Input
                            id="code"
                            name="code"
                            defaultValue={data.code}
                            placeholder="e.g. BF2024"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="discount">Percentage (%)</Label>
                        <Input
                            id="discount"
                            name="discount"
                            type="number"
                            defaultValue={data.discount}
                            min="0"
                            max="100"
                            placeholder="20"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 border p-4 rounded-md">
                    <Label htmlFor="isActive" className="cursor-pointer flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            value="true"
                            defaultChecked={data.isActive}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium">Active Status</span>
                    </Label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Discount'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
