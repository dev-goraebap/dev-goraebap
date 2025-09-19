import {
  pgTable,
  serial,
  varchar,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: serial().primaryKey().notNull(),
    email: varchar({ length: 254 }).notNull(),
    nickname: varchar({ length: 50 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique('UQ_97672ac88f789774dd47f7c8be3').on(table.email)],
);

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
