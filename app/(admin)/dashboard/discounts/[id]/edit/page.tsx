import EditDiscount from '@/modules/dashboard/discounts/edit-page';

export default async function EditDiscountPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    return <EditDiscount id={params.id} />;
}
