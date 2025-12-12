'use client';

import { useState, useTransition } from 'react';
import { broadcastNewsletter } from '@/server-action/newsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { BroadcastType, BroadcastPayload } from '@/types/newsletter';
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function BroadcastForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [type, setType] = useState<BroadcastType>('general');

  // Form States
  const [subject, setSubject] = useState('');

  // General
  const [content, setContent] = useState('');

  // Discount
  const [discountTitle, setDiscountTitle] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountDesc, setDiscountDesc] = useState('');
  const [discountValidUntil, setDiscountValidUntil] = useState('');
  const [discountLink, setDiscountLink] = useState('');

  // New Component
  const [compName, setCompName] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compImage, setCompImage] = useState('');
  const [compDemo, setCompDemo] = useState('');
  const [compBadge, setCompBadge] = useState('New Arrival');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !confirm(
        'Are you sure you want to send this broadcast to ALL active subscribers?',
      )
    ) {
      return;
    }

    let payload: BroadcastPayload;

    if (type === 'general') {
      if (!subject || !content) return toast.error('Fill all required fields');
      payload = {
        type: 'general',
        data: { subject, content },
      };
    } else if (type === 'discount') {
      if (
        !subject ||
        !discountTitle ||
        !discountCode ||
        !discountAmount ||
        !discountDesc ||
        !discountLink
      ) {
        return toast.error('Fill all required fields');
      }
      payload = {
        type: 'discount',
        data: {
          subject,
          title: discountTitle,
          code: discountCode,
          discountAmount,
          description: discountDesc,
          validUntil: discountValidUntil,
          ctaLink: discountLink,
        },
      };
    } else {
      if (!subject || !compName || !compDesc || !compImage || !compDemo) {
        return toast.error('Fill all required fields');
      }
      payload = {
        type: 'new_component',
        data: {
          subject,
          componentName: compName,
          description: compDesc,
          imageUrl: compImage,
          demoUrl: compDemo,
          badgeText: compBadge,
        },
      };
    }

    startTransition(async () => {
      const result = await broadcastNewsletter(payload);
      if (result.success) {
        toast.success(result.success);
        router.push('/dashboard/newsletter');
      } else {
        toast.error(result.error || 'Failed to send broadcast');
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Header Section */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
            Broadcast Newsletter
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Send updates, offers, or announcements to all your subscribers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16">
          {/* Section: Configuration */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border/40" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Configuration
              </h2>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <div className="space-y-8">
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Broadcast Type
                </FormLabel>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as BroadcastType)}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      General Message / Announcement
                    </SelectItem>
                    <SelectItem value="discount">Discount / Offer</SelectItem>
                    <SelectItem value="new_component">
                      New Component Release
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>

              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Email Subject
                </FormLabel>
                <FormControl>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Special Update for You"
                    disabled={isPending}
                    required
                    className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors text-base"
                  />
                </FormControl>
              </FormItem>
            </div>
          </section>

          {/* Section: Content based on Type */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border/40" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Content Details
              </h2>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            {type === 'general' && (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Content (HTML supported)
                </FormLabel>
                <FormControl>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="<p>Hello world...</p>"
                    className="min-h-[300px] font-mono bg-muted/30 border-border/60 hover:border-border transition-colors"
                    disabled={isPending}
                    required
                  />
                </FormControl>
              </FormItem>
            )}

            {type === 'discount' && (
              <div className="space-y-8">
                <div className="grid gap-8 sm:grid-cols-2">
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Offer Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        value={discountTitle}
                        onChange={(e) => setDiscountTitle(e.target.value)}
                        placeholder="e.g. Black Friday Sale"
                        disabled={isPending}
                        className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors"
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Discount Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        placeholder="e.g. 50% OFF"
                        disabled={isPending}
                        className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors"
                      />
                    </FormControl>
                  </FormItem>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Coupon Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="e.g. MOON50"
                        className="h-14 font-mono uppercase bg-muted/30 border-border/60 hover:border-border transition-colors"
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Valid Until (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        value={discountValidUntil}
                        onChange={(e) => setDiscountValidUntil(e.target.value)}
                        placeholder="e.g. Dec 31, 2025"
                        disabled={isPending}
                        className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors"
                      />
                    </FormControl>
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    CTA Link
                  </FormLabel>
                  <FormControl>
                    <Input
                      value={discountLink}
                      onChange={(e) => setDiscountLink(e.target.value)}
                      placeholder="https://moonui.com/pricing"
                      disabled={isPending}
                      className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors"
                    />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      value={discountDesc}
                      onChange={(e) => setDiscountDesc(e.target.value)}
                      placeholder="Get premium access for half the price..."
                      disabled={isPending}
                      className="min-h-[150px] bg-muted/30 border-border/60 hover:border-border transition-colors"
                    />
                  </FormControl>
                </FormItem>
              </div>
            )}

            {type === 'new_component' && (
              <div className="space-y-8">
                <div className="grid gap-8 sm:grid-cols-2">
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Component Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        value={compName}
                        onChange={(e) => setCompName(e.target.value)}
                        placeholder="e.g. Animated Grid"
                        disabled={isPending}
                        className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors"
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Badge Text
                    </FormLabel>
                    <FormControl>
                      <Input
                        value={compBadge}
                        onChange={(e) => setCompBadge(e.target.value)}
                        placeholder="New Arrival"
                        disabled={isPending}
                        className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors"
                      />
                    </FormControl>
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      value={compDesc}
                      onChange={(e) => setCompDesc(e.target.value)}
                      placeholder="A beautiful grid layout with animations..."
                      disabled={isPending}
                      className="min-h-[150px] bg-muted/30 border-border/60 hover:border-border transition-colors"
                    />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Image URL (Preview)
                  </FormLabel>
                  <FormControl>
                    <Input
                      value={compImage}
                      onChange={(e) => setCompImage(e.target.value)}
                      placeholder="https://..."
                      disabled={isPending}
                      className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors"
                    />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Demo/Component URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      value={compDemo}
                      onChange={(e) => setCompDemo(e.target.value)}
                      placeholder="https://moonui.com/components/..."
                      disabled={isPending}
                      className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors"
                    />
                  </FormControl>
                </FormItem>
              </div>
            )}
          </section>

          <div className="pt-8">
            <Button
              type="submit"
              disabled={isPending}
              size="lg"
              className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 transition-all"
            >
              {isPending ? 'Sending...' : 'Send Broadcast'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
              className="w-full h-14 mt-4 text-base font-medium border-border/60 hover:bg-muted/50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
