import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  jsonb,
  serial,
} from 'drizzle-orm/pg-core';
import { categoryGradients, users } from '@tables';

export const contentGradients = pgTable('content_gradients', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: jsonb('slug').notNull(),
  description: jsonb('description'),
  colors: jsonb('colors').notNull(),
  number: serial('number').notNull(),
  typeGradient: varchar('type_gradient', {
    length: 50,
    enum: ['linear', 'radial', 'conic'],
  }).notNull(),
  size: text('size'),
  format: text('format'),
  image: text('image').notNull(),
  urlBuyOneTime: text('url_buy_one_time'),
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
