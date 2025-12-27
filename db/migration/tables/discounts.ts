import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const discounts = pgTable('discounts', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    code: text('code').unique().notNull(),
    discount: integer('discount').notNull(), // Percentage 1-100
    isActive: boolean('isActive').default(true).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date()),
});
