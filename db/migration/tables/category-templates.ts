import { pgTable, text, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from '@tables';

export const categoryTemplates = pgTable('category_templates', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  parentId: text('parent_id').references((): any => categoryTemplates.id, {
    onDelete: 'set null',
  }),
  imageUrl: text('image_url'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});
