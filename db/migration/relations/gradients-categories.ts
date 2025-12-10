import { relations } from 'drizzle-orm';
import { categoryGradients, contentGradients, users } from '@tables';

export const categoryGradientsRelations = relations(
  categoryGradients,
  ({ one, many }) => ({
    user: one(users, {
      fields: [categoryGradients.userId],
      references: [users.id],
    }),
    parent: one(categoryGradients, {
      fields: [categoryGradients.parentId],
      references: [categoryGradients.id],
      relationName: 'parent_category',
    }),
    children: many(categoryGradients, {
      relationName: 'parent_category',
    }),
    gradients: many(contentGradients),
  }),
);
