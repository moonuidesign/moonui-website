export type BroadcastType = 'general' | 'discount' | 'new_component';

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

export interface NewComponentPayload {
  subject: string;
  componentName: string;
  description: string;
  imageUrl: string;
  demoUrl: string;
  badgeText?: string; // e.g. "New Arrival"
}

export type BroadcastPayload = 
  | { type: 'general'; data: GeneralPayload }
  | { type: 'discount'; data: DiscountPayload }
  | { type: 'new_component'; data: NewComponentPayload };
