import { relations } from 'drizzle-orm';
import { users } from '../tables/users';
import { licenses, licenseTransactions } from '@tables';

export const licensesRelations = relations(licenses, ({ one, many }) => ({
  user: one(users, { fields: [licenses.userId], references: [users.id] }),
  transactions: many(licenseTransactions),
}));
