import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { categoryComponents, users } from '@tables';

export const contentComponents = pgTable('content_components', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 100 }).notNull(),
  slug: jsonb('slug').notNull(),
  imageUrl: text('image_url'),
  copyComponentTextHTML: jsonb('copy_component_html').notNull(),
  copyComponentTextPlain: jsonb('copy_component_plain').notNull(),
  typeContent: text('type').notNull(),
  platform: varchar('platform', {
    length: 50,
    enum: ['web', 'ios', 'android', 'desktop', 'cross_platform', 'all'],
  }),
  statusContent: text('status_content').default('draft').notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  copyCount: integer('copy_count').default(0).notNull(),
  tier: varchar('tier', { length: 50, enum: ['free', 'pro'] })
    .default('free')
    .notNull(),
  codeSnippets: jsonb('code_snippets').$type<{
    react: string;
    vue: string;
    angular: string;
    html: string;
  }>(),
  number: integer('number').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryComponentsId: text('category_components_id').references(
    () => categoryComponents.id,
    { onDelete: 'set null' },
  ),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});
