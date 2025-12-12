import { relations } from 'drizzle-orm';
import { licenses, licenseTransactions, users } from '@tables';

export const licenseTransactionsRelations = relations(
  licenseTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [licenseTransactions.userId],
      references: [users.id],
    }),
    license: one(licenses, {
      fields: [licenseTransactions.licenseId],
      references: [licenses.id],
    }),
  }),
);
