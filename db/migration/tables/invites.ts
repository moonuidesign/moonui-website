import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const invites = pgTable('invites', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull(),
  role: varchar('role', { length: 50, enum: ['admin', 'user', 'superadmin'] }).notNull(),
  token: text('token').notNull().unique(),
  inviterId: text('inviterId').references(() => users.id),
  status: varchar('status', { length: 20, enum: ['pending', 'accepted', 'expired'] }).default('pending').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});
