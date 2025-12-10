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
import { Card, CardContent } from '@/components/ui/card';

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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Broadcast Type</label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as BroadcastType)}
              disabled={isPending}
            >
              <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Special Update for You"
              disabled={isPending}
              required
            />
          </div>
        </CardContent>
      </Card>

      {type === 'general' && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Content (HTML supported)
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<p>Hello world...</p>"
                className="min-h-[300px] font-mono"
                disabled={isPending}
                required
              />
            </div>
          </CardContent>
        </Card>
      )}

      {type === 'discount' && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Offer Title</label>
                <Input
                  value={discountTitle}
                  onChange={(e) => setDiscountTitle(e.target.value)}
                  placeholder="e.g. Black Friday Sale"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount Amount</label>
                <Input
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="e.g. 50% OFF"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Coupon Code</label>
                <Input
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="e.g. MOON50"
                  className="font-mono uppercase"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Valid Until (Optional)
                </label>
                <Input
                  value={discountValidUntil}
                  onChange={(e) => setDiscountValidUntil(e.target.value)}
                  placeholder="e.g. Dec 31, 2025"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CTA Link</label>
              <Input
                value={discountLink}
                onChange={(e) => setDiscountLink(e.target.value)}
                placeholder="https://moonui.com/pricing"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={discountDesc}
                onChange={(e) => setDiscountDesc(e.target.value)}
                placeholder="Get premium access for half the price..."
                disabled={isPending}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {type === 'new_component' && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Component Name</label>
                <Input
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. Animated Grid"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Badge Text</label>
                <Input
                  value={compBadge}
                  onChange={(e) => setCompBadge(e.target.value)}
                  placeholder="New Arrival"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={compDesc}
                onChange={(e) => setCompDesc(e.target.value)}
                placeholder="A beautiful grid layout with animations..."
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL (Preview)</label>
              <Input
                value={compImage}
                onChange={(e) => setCompImage(e.target.value)}
                placeholder="https://..."
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Demo/Component URL</label>
              <Input
                value={compDemo}
                onChange={(e) => setCompDemo(e.target.value)}
                placeholder="https://moonui.com/components/..."
                disabled={isPending}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="min-w-[150px]">
          {isPending ? 'Sending...' : 'Send Broadcast'}
        </Button>
      </div>
    </form>
  );
}
