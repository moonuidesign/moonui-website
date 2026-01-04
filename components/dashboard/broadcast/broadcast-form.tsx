'use client';

import { useState, useTransition, useEffect } from 'react';
import { broadcastNewsletter } from '@/server-action/newsletter';
import { getAssetsItems } from '@/server-action/getAssetsItems';
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
import { BroadcastType, BroadcastPayload, RelatedAsset } from '@/types/newsletter';
import { Label } from '@/components/ui/label';
import { Search, X, ChevronsUpDown, Check } from 'lucide-react';
import Image from 'next/image';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Debounce hook helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

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

  // Asset Release
  const [assetType, setAssetType] = useState<'components' | 'templates' | 'designs' | 'gradients'>(
    'components',
  );
  const [assetSearch, setAssetSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(assetSearch, 500);

  // Selected Main Asset values (auto-filled but editable)
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [assetName, setAssetName] = useState('');
  const [assetDesc, setAssetDesc] = useState('');
  const [assetImage, setAssetImage] = useState('');
  const [assetBadge, setAssetBadge] = useState('New Release');
  console.log(assetImage);
  // Related Assets
  const [relatedAssets, setRelatedAssets] = useState<RelatedAsset[]>([]);
  const [relatedSearch, setRelatedSearch] = useState('');
  const [relatedResults, setRelatedResults] = useState<any[]>([]);
  const debouncedRelatedSearch = useDebounce(relatedSearch, 500);
  const [openRelated, setOpenRelated] = useState(false);

  // Clear related assets when assetType changes
  useEffect(() => {
    setRelatedAssets([]);
    setRelatedSearch('');
    setRelatedResults([]);
  }, [assetType]);

  // Search Effect for Main Asset
  useEffect(() => {
    if (!debouncedSearch) {
      setSearchResults([]);
      return;
    }
    const fetchAssets = async () => {
      setIsSearching(true);
      const res = await getAssetsItems(
        {
          contentType: assetType,
          searchQuery: debouncedSearch,
        },
        { limit: 5 },
      );
      setSearchResults(res.items);
      setIsSearching(false);
    };
    fetchAssets();
  }, [debouncedSearch, assetType]);

  // Search Effect for Related Assets
  useEffect(() => {
    if (!debouncedRelatedSearch) {
      setRelatedResults([]);
      return;
    }
    const fetchRelated = async () => {
      const res = await getAssetsItems(
        {
          // Search across all types or just the current type?
          // User request implies "relevant cards", usually same category or manually picked.
          // Let's assume we can search current type for now, or maybe add a type selector for related.
          // For simplicity, let's search the SAME assetType first.
          contentType: assetType,
          searchQuery: debouncedRelatedSearch,
        },
        { limit: 5 },
      );
      setRelatedResults(res.items);
    };
    fetchRelated();
  }, [debouncedRelatedSearch, assetType]);

  const normalizeImageUrl = (url: any): string => {
    if (!url) return '';

    let urlString = '';
    if (typeof url === 'string') {
      urlString = url;
    } else if (Array.isArray(url) && url.length > 0) {
      if (typeof url[0] === 'string') urlString = url[0];
      else if (typeof url[0] === 'object' && url[0]?.url) urlString = url[0].url;
    } else if (typeof url === 'object' && 'url' in url) {
      urlString = url.url;
    }

    if (!urlString) return '';

    // Check if relative path (starts with /) - Next.js Image supports this
    if (urlString.startsWith('/')) return urlString;

    // Check if valid absolute URL
    try {
      new URL(urlString);
      return urlString;
    } catch (e) {
      // Not a valid absolute URL and not a relative path starting with /
      return '';
    }
  };

  const selectMainAsset = (item: any) => {
    setSelectedAssetId(item.id);
    setAssetName(item.title);
    setAssetDesc(item.description || item.title + ' - A new premium asset.'); // Fallback description
    setAssetImage(normalizeImageUrl(item.imageUrl));
    setSubject(`New Release: ${item.title}`);
    setAssetSearch(''); // Clear search to hide list
  };

  const addRelatedAsset = (item: any) => {
    if (relatedAssets.length >= 3) return toast.error('Max 3 related assets');
    if (relatedAssets.find((a) => a.id === item.id)) return toast.error('Already added');

    setRelatedAssets([
      ...relatedAssets,
      {
        id: item.id,
        title: item.title,
        imageUrl: normalizeImageUrl(item.imageUrl),
        type: assetType, // Currently restricted to same type
        tier: item.tier,
      },
    ]);
    setRelatedSearch('');
  };

  const removeRelatedAsset = (id: string) => {
    setRelatedAssets(relatedAssets.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirm('Are you sure you want to send this broadcast to ALL active subscribers?')) {
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
      if (!subject || !assetName || !assetDesc || !assetImage) {
        return toast.error('Fill all required fields');
      }
      payload = {
        type: 'asset_release',
        data: {
          subject,
          assetType,
          assetId: selectedAssetId,
          assetName,
          description: assetDesc,
          imageUrl: assetImage,
          badgeText: assetBadge,
          relatedAssets,
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
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Header Section */}
        <div className="mb-16">
          <h1 className="text-foreground mb-4 text-5xl font-bold tracking-tight text-balance">
            Broadcast Newsletter
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Send updates, offers, or announcements to all your subscribers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16">
          {/* Section: Configuration */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="bg-border/40 h-px flex-1" />
              <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                Configuration
              </h2>
              <div className="bg-border/40 h-px flex-1" />
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <Label className="text-foreground text-sm font-medium">Broadcast Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as BroadcastType)}
                  disabled={isPending}
                >
                  <SelectTrigger className="bg-muted/30 border-border/60 hover:border-border h-14 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Message / Announcement</SelectItem>
                    <SelectItem value="discount">Discount / Offer</SelectItem>
                    <SelectItem value="asset_release">Asset Release</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground text-sm font-medium">Email Subject</Label>

                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Special Update for You"
                  disabled={isPending}
                  required
                  className="bg-muted/30 border-border/60 hover:border-border h-14 text-base transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Section: Content based on Type */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="bg-border/40 h-px flex-1" />
              <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                Content Details
              </h2>
              <div className="bg-border/40 h-px flex-1" />
            </div>

            {type === 'general' && (
              <div className="space-y-2">
                <Label className="text-foreground text-sm font-medium">
                  Content (HTML supported)
                </Label>

                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<p>Hello world...</p>"
                  className="bg-muted/30 border-border/60 hover:border-border min-h-[300px] font-mono transition-colors"
                  disabled={isPending}
                  required
                />
              </div>
            )}

            {type === 'discount' && (
              <div className="space-y-8">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground text-sm font-medium">Offer Title</Label>

                    <Input
                      value={discountTitle}
                      onChange={(e) => setDiscountTitle(e.target.value)}
                      placeholder="e.g. Black Friday Sale"
                      disabled={isPending}
                      className="bg-muted/30 border-border/60 hover:border-border h-14 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground text-sm font-medium">Discount Amount</Label>

                    <Input
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      placeholder="e.g. 50% OFF"
                      disabled={isPending}
                      className="bg-muted/30 border-border/60 hover:border-border h-14 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground text-sm font-medium">Coupon Code</Label>

                    <Input
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="e.g. MOON50"
                      className="bg-muted/30 border-border/60 hover:border-border h-14 font-mono uppercase transition-colors"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground text-sm font-medium">
                      Valid Until (Optional)
                    </Label>

                    <Input
                      value={discountValidUntil}
                      onChange={(e) => setDiscountValidUntil(e.target.value)}
                      placeholder="e.g. Dec 31, 2025"
                      disabled={isPending}
                      className="bg-muted/30 border-border/60 hover:border-border h-14 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground text-sm font-medium">CTA Link</Label>

                  <Input
                    value={discountLink}
                    onChange={(e) => setDiscountLink(e.target.value)}
                    placeholder="https://moonui.com/pricing"
                    disabled={isPending}
                    className="bg-muted/30 border-border/60 hover:border-border h-14 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground text-sm font-medium">Description</Label>

                  <Textarea
                    value={discountDesc}
                    onChange={(e) => setDiscountDesc(e.target.value)}
                    placeholder="Get premium access for half the price..."
                    disabled={isPending}
                    className="bg-muted/30 border-border/60 hover:border-border min-h-[150px] transition-colors"
                  />
                </div>
              </div>
            )}

            {type === 'asset_release' && (
              <div className="space-y-8">
                {/* Asset Type Selector */}
                <div className="space-y-2">
                  <Label className="text-foreground text-sm font-medium">Asset Type</Label>
                  <Select
                    value={assetType}
                    onValueChange={(v: any) => setAssetType(v)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="bg-muted/30 border-border/60 hover:border-border h-14 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="components">Components</SelectItem>
                      <SelectItem value="templates">Templates</SelectItem>
                      <SelectItem value="designs">Designs</SelectItem>
                      <SelectItem value="gradients">Gradients</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Main Asset Search */}
                <div className="relative space-y-2">
                  <Label className="text-foreground text-sm font-medium">Search Asset</Label>
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
                    <Input
                      value={assetSearch}
                      onChange={(e) => setAssetSearch(e.target.value)}
                      placeholder={`Search ${assetType}...`}
                      className="bg-muted/30 border-border/60 hover:border-border h-14 pl-12 transition-colors"
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {assetSearch && searchResults.length > 0 && (
                    <div className="bg-background border-border absolute top-full right-0 left-0 z-10 mt-2 max-h-60 overflow-hidden overflow-y-auto rounded-lg border shadow-xl">
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => selectMainAsset(item)}
                          className="hover:bg-muted flex cursor-pointer items-center gap-3 p-3 transition-colors"
                        >
                          <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded">
                            {(() => {
                              const src = normalizeImageUrl(item.imageUrl || item.image);
                              return src ? (
                                <Image src={src} alt={item.title} fill className="object-cover" />
                              ) : null;
                            })()}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{item.title}</div>
                            <div className="text-muted-foreground text-xs capitalize">
                              {item.tier || 'Free'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground text-sm font-medium">Asset Name</Label>
                    <Input
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      disabled={isPending}
                      className="bg-muted/30 border-border/60 hover:border-border h-14 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground text-sm font-medium">Badge Text</Label>
                    <Input
                      value={assetBadge}
                      onChange={(e) => setAssetBadge(e.target.value)}
                      disabled={isPending}
                      className="bg-muted/30 border-border/60 hover:border-border h-14 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground text-sm font-medium">Description</Label>
                  <Textarea
                    value={assetDesc}
                    onChange={(e) => setAssetDesc(e.target.value)}
                    disabled={isPending}
                    className="bg-muted/30 border-border/60 hover:border-border min-h-[150px] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground text-sm font-medium">Image URL (Preview)</Label>
                  <Input
                    value={assetImage}
                    onChange={(e) => setAssetImage(e.target.value)}
                    disabled={isPending}
                    className="bg-muted/30 border-border/60 hover:border-border h-14 transition-colors"
                  />
                  {(() => {
                    const src = normalizeImageUrl(assetImage);
                    return src ? (
                      <div className="relative h-48 w-full overflow-hidden rounded-lg border">
                        <Image src={src} alt="Preview" fill className="object-cover" />
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Related Assets Section */}
                <div className="border-border/50 border-t pt-8">
                  <h3 className="mb-4 text-lg font-semibold">Related Assets (Max 3)</h3>

                  {/* Related Search Combobox */}
                  <div className="mb-6 space-y-2">
                    <Label className="text-foreground text-sm font-medium">Add Related Asset</Label>
                    <Popover open={openRelated} onOpenChange={setOpenRelated}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openRelated}
                          className="bg-muted/30 border-border/60 hover:border-border h-14 w-full justify-between px-3 text-base font-normal transition-colors"
                          disabled={relatedAssets.length >= 3}
                        >
                          <span className="text-muted-foreground w-full text-left">
                            {relatedAssets.length >= 3 ? 'Max assets added' : 'Search to add...'}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder={`Search ${assetType}...`}
                            value={relatedSearch}
                            onValueChange={setRelatedSearch}
                          />
                          <CommandList>
                            {isSearching && (
                              <div className="py-6 text-center text-sm">Searching...</div>
                            )}
                            {!isSearching && relatedResults.length === 0 && (
                              <CommandEmpty>No results found.</CommandEmpty>
                            )}
                            <CommandGroup>
                              {relatedResults.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  value={item.id} // or item.title
                                  onSelect={() => {
                                    addRelatedAsset(item);
                                    setOpenRelated(false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <div className="flex w-full items-center gap-3">
                                    <div className="bg-muted relative h-8 w-8 shrink-0 overflow-hidden rounded">
                                      {(() => {
                                        const src = normalizeImageUrl(item.imageUrl || item.image);
                                        return src ? (
                                          <Image
                                            src={src}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                          />
                                        ) : null;
                                      })()}
                                    </div>
                                    <div className="flex-1 truncate">
                                      <span className="font-medium">{item.title}</span>
                                      <span className="text-muted-foreground ml-2 text-xs capitalize">
                                        {item.tier}
                                      </span>
                                    </div>
                                    {relatedAssets.some((a) => a.id === item.id) && (
                                      <Check className="ml-auto h-4 w-4 opacity-50" />
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Selected Related Assets List */}
                  {relatedAssets.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {relatedAssets.map((item) => (
                        <div
                          key={item.id}
                          className="group bg-muted/10 relative rounded-lg border p-3"
                        >
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => removeRelatedAsset(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="bg-muted relative mb-2 aspect-[4/3] overflow-hidden rounded-md">
                            {(() => {
                              const src = normalizeImageUrl(item.imageUrl);
                              return src ? (
                                <Image src={src} alt={item.title} fill className="object-cover" />
                              ) : null;
                            })()}
                          </div>
                          <div className="truncate text-sm font-medium">{item.title}</div>
                          <div className="text-muted-foreground text-xs capitalize">
                            {item.tier || 'Free'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <div className="pt-8">
            <Button
              type="submit"
              disabled={isPending}
              size="lg"
              className="bg-primary hover:bg-primary/90 h-14 w-full text-base font-semibold transition-all"
            >
              {isPending ? 'Sending...' : 'Send Broadcast'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
              className="border-border/60 hover:bg-muted/50 mt-4 h-14 w-full text-base font-medium"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
