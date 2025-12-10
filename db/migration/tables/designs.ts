import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { categoryDesigns, users } from '@tables';

export const contentDesigns = pgTable('content_designs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 255 }).notNull(),
  slug: jsonb('slug').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  tier: varchar('tier', { length: 50, enum: ['free', 'pro_plus'] })
    .default('free')
    .notNull(),
  number: integer('number'),
  statusContent: text('status_content').default('draft').notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  downloadCount: integer('download_count').default(0),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryDesignsId: text('category_designs_id').references(
    () => categoryDesigns.id,
    { onDelete: 'set null' },
  ),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});
