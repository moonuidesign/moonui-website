import { categoryComponents } from '@/db/migration/schema';
import { InferSelectModel } from 'drizzle-orm';

export type CategoryComponent = InferSelectModel<typeof categoryComponents>;

// Struktur props untuk navigasi
export interface NavCategoryItem {
  id: string;
  name: string;
  slug: string;
  count?: number;
}
