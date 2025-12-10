import { pgTable, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from '@tables';

export const licenses = pgTable(
  'licenses',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    licenseKey: text('license_key').unique().notNull(),
    status: varchar('status', {
      length: 50,
      enum: ['active', 'inactive', 'expired', 'disabled'],
    })
      .default('inactive')
      .notNull(),
    planType: varchar('plan_type', {
      length: 50,
      enum: ['subscribe', 'one_time'],
    })
      .default('subscribe')
      .notNull(),
    tier: varchar('tier', {
      length: 50,
      enum: ['pro', 'pro_plus'],
    })
      .default('pro')
      .notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    licenseKeyIndex: index('license_key_index').on(table.licenseKey),
    userIdIndex: index('user_id_index').on(table.userId),
  }),
);
