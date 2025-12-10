import { relations } from 'drizzle-orm';
import { users } from '../tables/users';
import { categoryDesigns } from '@tables';
import { contentDesigns } from '@tables';

export const categoryDesignsRelations = relations(
  categoryDesigns,
  ({ one, many }) => ({
    user: one(users, {
      fields: [categoryDesigns.userId],
      references: [users.id],
    }),
    parent: one(categoryDesigns, {
      fields: [categoryDesigns.parentId],
      references: [categoryDesigns.id],
      relationName: 'parent_category',
    }),
    children: many(categoryDesigns, {
      relationName: 'parent_category',
    }),
    designs: many(contentDesigns),
  }),
);
