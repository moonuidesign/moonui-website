import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { categoryGradients, users } from '@tables';

export const contentGradients = pgTable('content_gradients', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: jsonb('slug').notNull(),
  colors: jsonb('colors').notNull(),
  number: integer('number').notNull(),
  typeGradient: varchar('type_gradient', {
    length: 50,
    enum: ['linear', 'radial', 'conic'],
  }).notNull(),
  image: text('image').notNull(),
  linkDownload: text('link_download').notNull(),
  downloadCount: integer('download_count').default(0).notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tier: varchar('tier', { length: 50, enum: ['free', 'pro'] })
    .default('free')
    .notNull(),
  categoryGradientsId: text('category_gradients_id').references(
    () => categoryGradients.id,
    { onDelete: 'set null' },
  ),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});
