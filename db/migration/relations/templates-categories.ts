import { relations } from 'drizzle-orm';
import { categoryTemplates, contentTemplates, users } from '@tables';

export const categoryTemplatesRelations = relations(
  categoryTemplates,
  ({ one, many }) => ({
    user: one(users, {
      fields: [categoryTemplates.userId],
      references: [users.id],
    }),
    parent: one(categoryTemplates, {
      fields: [categoryTemplates.parentId],
      references: [categoryTemplates.id],
      relationName: 'parent_category',
    }),
    children: many(categoryTemplates, {
      relationName: 'parent_category',
    }),
    templates: many(contentTemplates),
  }),
);
