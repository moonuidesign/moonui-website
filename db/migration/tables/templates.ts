import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { categoryTemplates, users } from '@tables';

export const contentTemplates = pgTable('content_templates', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 255 }).notNull(),
  slug: jsonb('slug').notNull(),
  description: text('description'),
  assetUrl: jsonb('asset_url').notNull(),
  urlPreview: text('url_preview'),
  typeContent: text('type').notNull(),
  linkTemplate: text('link_template'),
  linkDonwload: text('link_download').notNull(),
  tier: varchar('tier', { length: 50, enum: ['free', 'pro_plus'] })
    .default('free')
    .notNull(),
  number: integer('number'),
  platform: varchar('platform', {
    length: 50,
    enum: ['web', 'ios', 'android', 'desktop', 'cross_platform', 'all'],
  })
    .default('web')
    .notNull(),
  statusContent: text('status_content').default('draft').notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  downloadCount: integer('download_count').default(0),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryTemplatesId: text('category_templates_id').references(
    () => categoryTemplates.id,
    { onDelete: 'set null' },
  ),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});
