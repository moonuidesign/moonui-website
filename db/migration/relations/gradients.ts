import { relations } from 'drizzle-orm';
import { categoryGradients, contentGradients, users } from '@tables';

export const contentGradientsRelations = relations(
  contentGradients,
  ({ one }) => ({
    user: one(users, {
      fields: [contentGradients.userId],
      references: [users.id],
    }),
    category: one(categoryGradients, {
      fields: [contentGradients.categoryGradientsId],
      references: [categoryGradients.id],
    }),
  }),
);
