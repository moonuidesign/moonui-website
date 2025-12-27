'use client';

import { createDiscount } from '@/server-action/action-discount';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';


export default function CreateDiscount() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await createDiscount(formData);
        setLoading(false);

        if ('error' in result) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
            router.push('/dashboard/discounts');
        }
    }

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
                <h1 className="text-3xl font-bold tracking-tight">Create New Discount</h1>
                <p className="text-muted-foreground">
                    Add a new discount code for your customers.
                </p>
            </div>

            <form action={handleSubmit} className="space-y-6 border p-6 rounded-lg bg-white shadow-sm">
                <div className="space-y-2">
                    <Label htmlFor="name">Discount Name</Label>
                    <Input
                        id="name"
                        name="name"
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
                            min="0"
                            max="100"
                            placeholder="20"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2 border p-4 rounded-md">
                    <input type="hidden" name="isActive" value="true" />
                    {/* Simple checkbox/switch implementation for now since we rely on formData */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status Active</span>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Discount'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
