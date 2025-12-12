import { relations } from 'drizzle-orm';
import { contentDesigns, users } from '@/db/migration';
import { categoryDesigns } from '@tables';

export const contentDesignsRelations = relations(contentDesigns, ({ one }) => ({
  user: one(users, {
    fields: [contentDesigns.userId],
    references: [users.id],
  }),
  category: one(categoryDesigns, {
    fields: [contentDesigns.categoryDesignsId],
    references: [categoryDesigns.id],
  }),
}));
