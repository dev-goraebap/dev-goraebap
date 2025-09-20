import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const tags = pgTable('tags', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: varchar({ length: 500 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' }),
});

export type SelectTag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
