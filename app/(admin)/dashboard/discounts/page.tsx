import ListDiscount from '@/modules/dashboard/discounts/list-page';
import { Suspense } from 'react';

export default function DiscountPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ListDiscount />
        </Suspense>
    );
}
