import { relations } from 'drizzle-orm';
import { sessions, users } from '../schema';

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
