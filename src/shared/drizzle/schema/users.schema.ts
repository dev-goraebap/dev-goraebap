import {
  pgTable,
  serial,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial().primaryKey(),
  email: varchar({ length: 254 }).notNull().unique(),
  nickname: varchar({ length: 50 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .defaultNow()
    .notNull(),
});

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
