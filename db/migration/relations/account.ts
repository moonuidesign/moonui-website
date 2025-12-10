import { relations } from 'drizzle-orm';
import { accounts, users } from '@tables';

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));
