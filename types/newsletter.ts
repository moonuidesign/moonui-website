export type BroadcastType = 'general' | 'discount' | 'asset_release';

export interface GeneralPayload {
  subject: string;
  content: string; // HTML allowed
}

export interface DiscountPayload {
  subject: string;
  title: string;
  code: string;
  discountAmount: string; // e.g., "50% OFF" or "$20 OFF"
  description: string;
  validUntil?: string;
  ctaLink: string;
}

export interface RelatedAsset {
  id: string;
  title: string;
  imageUrl: string;
  type: 'components' | 'templates' | 'designs' | 'gradients';
  tier?: 'free' | 'pro' | 'pro_plus';
}

export interface AssetReleasePayload {
  subject: string;
  assetType: 'components' | 'templates' | 'designs' | 'gradients';
  assetId: string;
  assetName: string;
  description: string;
  imageUrl: string;
  demoUrl?: string; // Optional, defaults to dynamic route
  badgeText?: string;
  relatedAssets?: RelatedAsset[];
}

export type BroadcastPayload =
  | { type: 'general'; data: GeneralPayload }
  | { type: 'discount'; data: DiscountPayload }
  | { type: 'asset_release'; data: AssetReleasePayload };
