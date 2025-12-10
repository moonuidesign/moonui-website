import { relations } from 'drizzle-orm';
import { categoryComponents, contentComponents, users } from '@tables';

export const contentComponentsRelations = relations(
  contentComponents,
  ({ one }) => ({
    user: one(users, {
      fields: [contentComponents.userId],
      references: [users.id],
    }),
    category: one(categoryComponents, {
      fields: [contentComponents.categoryComponentsId],
      references: [categoryComponents.id],
    }),
  }),
);
