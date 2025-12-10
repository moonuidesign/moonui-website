import { relations } from 'drizzle-orm';
import { categoryTemplates, contentTemplates, users } from '@tables';

export const contentTemplatesRelations = relations(
  contentTemplates,
  ({ one }) => ({
    user: one(users, {
      fields: [contentTemplates.userId],
      references: [users.id],
    }),
    category: one(categoryTemplates, {
      fields: [contentTemplates.categoryTemplatesId],
      references: [categoryTemplates.id],
    }),
  }),
);
