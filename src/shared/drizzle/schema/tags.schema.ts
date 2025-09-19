import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  foreignKey,
  unique,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const tags = pgTable(
  'tags',
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: varchar({ length: 500 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    userId: integer('user_id'),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'FK_74603743868d1e4f4fc2c0225b6',
    }).onDelete('cascade'),
    unique('UQ_d90243459a697eadb8ad56e9092').on(table.name),
  ],
);

export type SelectTag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
