import {
  text,
  varchar,
  timestamp,
  integer,
  jsonb,
  pgTable,
  serial,
} from 'drizzle-orm/pg-core';
import { categoryDesigns, users } from '@tables';

export const contentDesigns = pgTable('content_designs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 255 }).notNull(),
  slug: jsonb('slug').notNull(),
  description: jsonb('description'),
  imagesUrl: jsonb('images_url'),
  tier: varchar('tier', { length: 50, enum: ['free', 'pro'] })
    .default('free')
    .notNull(),
  urlBuyOneTime: text('url_buy_one_time'),
  size: text('size'),
  format: text('format'),
  linkDownload: text('link_download').notNull(),
  number: serial('number').notNull(),
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
