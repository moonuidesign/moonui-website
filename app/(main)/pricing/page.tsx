import NewsletterSection from '@/components/landing-page/newslatter';
import PricingSection from '@/components/pricing';
import { getActiveDiscount } from '@/server-action/action-discount';

export default async function Page() {
  const activeDiscount = await getActiveDiscount();

  return <>
    <PricingSection activeDiscount={activeDiscount} />
    <NewsletterSection />
  </>;
}
