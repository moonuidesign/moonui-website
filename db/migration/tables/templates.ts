import { pgTable, text, varchar, timestamp, integer, jsonb, serial } from 'drizzle-orm/pg-core';
import { categoryTemplates, users } from '@tables';

export const contentTemplates = pgTable('content_templates', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 255 }).notNull(),
  slug: jsonb('slug').notNull(),
  description: jsonb('description'),
  imagesUrl: jsonb('images_url').notNull(),
  urlPreview: text('url_preview'),
  size: text('size'),
  format: text('format'),
  typeContent: text('type').notNull(),
  linkDonwload: text('link_download').notNull(),
  tier: varchar('tier', { length: 50, enum: ['free', 'pro'] })
    .default('free')
    .notNull(),
  number: serial('number').notNull().unique(),
  urlBuyOneTime: text('url_buy_one_time'),
  statusContent: text('status_content').default('draft').notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  downloadCount: integer('download_count').default(0),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryTemplatesId: text('category_templates_id').references(() => categoryTemplates.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});
