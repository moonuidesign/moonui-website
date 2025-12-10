import { relations } from 'drizzle-orm';
import { categoryComponents, contentComponents, users } from '@tables';

export const categoryComponentsRelations = relations(
  categoryComponents,
  ({ one, many }) => ({
    user: one(users, {
      fields: [categoryComponents.userId],
      references: [users.id],
    }),
    parent: one(categoryComponents, {
      fields: [categoryComponents.parentId],
      references: [categoryComponents.id],
      relationName: 'parent_category',
    }),
    children: many(categoryComponents, {
      relationName: 'parent_category',
    }),
    components: many(contentComponents),
  }),
);
