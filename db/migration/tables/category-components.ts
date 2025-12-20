import { pgTable, text, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from '@tables';

export const categoryComponents = pgTable('category_components', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }).notNull(),
  imageUrl: text('image_url'),
  parentId: text('parent_id').references((): any => categoryComponents.id, {
    onDelete: 'set null',
  }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});
