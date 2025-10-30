import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { AdapterAccountType } from 'next-auth/adapters';

// =================================================================
// BAGIAN 1: PENGGUNA & OTENTIKASI
// =================================================================

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  verificationToken: text('verificationToken'),
  resetToken: text('resetToken'),
  resetTokenExpiry: timestamp('resetTokenExpiry'),
  verificationExpiry: timestamp('verificationExpiry'),
  image: text('image'),
  generate: integer('generate').default(3),
  password: text('password'),
  roleUser: varchar('roleUser', { length: 50, enum: ['admin', 'user'] })
    .default('user')
    .notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compositePk: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// =================================================================
// BAGIAN 2: LISENSI (LEMONSQUEEZEE)
// =================================================================

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
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
    activatedOn: text('activated_on'), // e.g., domain name
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    licenseKeyIndex: index('license_key_index').on(table.licenseKey),
    userIdIndex: index('user_id_index').on(table.userId),
  }),
);

// RELATIONS
export const licensesRelations = relations(licenses, ({ one }) => ({
  user: one(users, { fields: [licenses.userId], references: [users.id] }),
}));

// Update users relation to include licenses
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  licenses: many(licenses),
}));
