import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { licenses, users } from '@tables';

export const licenseTransactions = pgTable('license_transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  licenseId: text('license_id').references(() => licenses.id, {
    onDelete: 'set null',
  }),
  transactionType: varchar('transaction_type', { length: 50 })
    .default('activation')
    .notNull(), // activation, renewal, etc.
  amount: integer('amount').default(0).notNull(), // Amount in cents/smallest unit
  status: varchar('status', { length: 50 }).default('success').notNull(),
  metadata: jsonb('metadata'), // Store extra info like discount code, IP, etc.
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});
