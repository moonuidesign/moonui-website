import { relations } from 'drizzle-orm';

import {
  users,
  accounts,
  sessions,
  licenses,
  licenseTransactions,
  contentTemplates,
  contentComponents,
  contentGradients,
  contentDesigns,
  categoryTemplates,
  categoryComponents,
  categoryGradients,
  categoryDesigns,
} from '@tables';

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  licenses: many(licenses),
  licenseTransactions: many(licenseTransactions),
  contentTemplates: many(contentTemplates),
  contentComponents: many(contentComponents),
  contentGradients: many(contentGradients),
  contentDesigns: many(contentDesigns),
  categoryTemplates: many(categoryTemplates),
  categoryComponents: many(categoryComponents),
  categoryGradients: many(categoryGradients),
  categoryDesigns: many(categoryDesigns),
}));
