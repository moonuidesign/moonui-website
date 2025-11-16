import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  index,
  primaryKey,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { AdapterAccountType } from 'next-auth/adapters';

// =================================================================
// ENUMS (ENUMERASI)
// =================================================================

export const typeEnum = pgEnum('type', ['figma', 'framer']);

export const contentStatusEnum = pgEnum('content_status', [
  'draft',
  'published',
  'archived',
]);

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
  image: text('image'),
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

// =================================================================
// BAGIAN 2: KATEGORI & SUB-KATEGORI (Struktur Hierarkis)
// =================================================================

export const categoryTemplates = pgTable('category_templates', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).unique().notNull(),
  description: text('description'),
  parentId: text('parent_id').references((): any => categoryTemplates.id, {
    onDelete: 'set null',
  }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

export const categoryComponents = pgTable('category_components', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).unique().notNull(),
  description: text('description'),
  parentId: text('parent_id').references((): any => categoryComponents.id, {
    onDelete: 'set null',
  }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

export const categoryGradients = pgTable('category_gradients', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).unique().notNull(),
  parentId: text('parent_id').references((): any => categoryGradients.id, {
    onDelete: 'set null',
  }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

// =================================================================
// BAGIAN 3: KONTEN (ASET DIGITAL)
// =================================================================

export const contentTemplates = pgTable('content_templates', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 280 }).unique().notNull(),
  description: text('description'),
  assetUrl: jsonb('asset_url').notNull(),
  urlPreview: text('url_preview'),
  compatibility: varchar('compatibility', { length: 100 }),
  type: typeEnum('type').notNull(),
  status: contentStatusEnum('status').default('draft').notNull(),
  viewCount: integer('view_count').default(0).notNull(),

  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryTemplatesId: text('category_templates_id').references(
    () => categoryTemplates.id,
    { onDelete: 'set null' },
  ),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

export const contentComponents = pgTable('content_components', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).unique().notNull(),
  imageUrl: text('image_url'),
  type: typeEnum('type').notNull(),
  status: contentStatusEnum('status').default('draft').notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  copyCount: integer('copy_count').default(0).notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryComponentsId: text('category_components_id').references(
    () => categoryComponents.id,
    { onDelete: 'set null' },
  ),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

export const contentGradients = pgTable('content_gradients', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 120 }).unique().notNull(),
  colors: jsonb('colors').notNull(),
  downloadCount: integer('download_count').default(0).notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryGradientsId: text('category_gradients_id').references(
    () => categoryGradients.id,
    { onDelete: 'set null' },
  ),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

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
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    licenseKeyIndex: index('license_key_index').on(table.licenseKey),
    userIdIndex: index('user_id_index').on(table.userId),
  }),
);

// =================================================================
// BAGIAN 6: RELATIONS
// =================================================================

// Relasi untuk Auth & User
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  licenses: many(licenses),
  contentTemplates: many(contentTemplates),
  contentComponents: many(contentComponents),
  contentGradients: many(contentGradients),
  categoryTemplates: many(categoryTemplates),
  categoryComponents: many(categoryComponents),
  categoryGradients: many(categoryGradients),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// Relasi untuk Kategori dengan Sub-Kategori
export const categoryTemplatesRelations = relations(
  categoryTemplates,
  ({ one, many }) => ({
    user: one(users, {
      fields: [categoryTemplates.userId],
      references: [users.id],
    }),
    parent: one(categoryTemplates, {
      fields: [categoryTemplates.parentId],
      references: [categoryTemplates.id],
      relationName: 'parent_category',
    }),
    children: many(categoryTemplates, {
      relationName: 'parent_category',
    }),
    templates: many(contentTemplates),
  }),
);

export const categoryComponentsRelations = relations(
  categoryComponents,
  ({ one, many }) => ({
    user: one(users, {
      fields: [categoryComponents.userId],
      references: [users.id],
    }),
    parent: one(categoryComponents, {
      fields: [categoryComponents.parentId],
      references: [categoryComponents.id],
      relationName: 'parent_category',
    }),
    children: many(categoryComponents, {
      relationName: 'parent_category',
    }),
    components: many(contentComponents),
  }),
);

export const categoryGradientsRelations = relations(
  categoryGradients,
  ({ one, many }) => ({
    user: one(users, {
      fields: [categoryGradients.userId],
      references: [users.id],
    }),
    parent: one(categoryGradients, {
      fields: [categoryGradients.parentId],
      references: [categoryGradients.id],
      relationName: 'parent_category',
    }),
    children: many(categoryGradients, {
      relationName: 'parent_category',
    }),
    gradients: many(contentGradients),
  }),
);

// Relasi untuk Konten
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

export const contentGradientsRelations = relations(
  contentGradients,
  ({ one }) => ({
    user: one(users, {
      fields: [contentGradients.userId],
      references: [users.id],
    }),
    category: one(categoryGradients, {
      fields: [contentGradients.categoryGradientsId],
      references: [categoryGradients.id],
    }),
  }),
);

// Relasi untuk Lisensi
export const licensesRelations = relations(licenses, ({ one }) => ({
  user: one(users, { fields: [licenses.userId], references: [users.id] }),
}));
