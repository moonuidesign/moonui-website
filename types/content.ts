// types/content.ts
import {
  contentComponents,
  contentGradients,
  contentTemplates,
} from '@/db/migration/schema';
import { InferSelectModel } from 'drizzle-orm';

// Mengambil tipe langsung dari Drizzle Schema
export type ContentComponent = InferSelectModel<typeof contentComponents>;
export type ContentTemplate = InferSelectModel<typeof contentTemplates>;
export type ContentGradient = InferSelectModel<typeof contentGradients>;

// Union type untuk props komponen agar reusable
export type ResourceItem =
  | (ContentComponent & { type: 'component' })
  | (ContentTemplate & { type: 'template' })
  | (ContentGradient & { type: 'gradient' });

export type TierType = 'free' | 'pro' | 'pro_plus';
