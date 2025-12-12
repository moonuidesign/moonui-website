import { categoryComponents } from '@/db/migration';
import { InferSelectModel } from 'drizzle-orm';

export type CategoryComponent = InferSelectModel<typeof categoryComponents>;

// Struktur props untuk navigasi
export interface NavCategoryItem {
  id: string;
  name: string;
  slug: string;
  count?: number;
  children?: NavCategoryItem[];
}
