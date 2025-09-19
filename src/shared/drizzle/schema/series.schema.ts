import {
  foreignKey,
  integer,
  pgTable,
  serial,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const series = pgTable(
  'series',
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 1000 }),
    status: varchar({ length: 20 }).default('PLAN').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    userId: integer('user_id'),
    slug: varchar({ length: 255 }).notNull(),
    publishedAt: timestamp('published_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    isPublishedYn: varchar('is_published_yn').default('N').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'FK_49e0b924b7da7f822f0983cf9f9',
    }).onDelete('cascade'),
    unique('UQ_68b808a9039892c61219f868f2a').on(table.name),
    unique('UQ_aabf879e0e06d1b37922d5c9664').on(table.slug),
  ],
);

export type SelectSeries = typeof series.$inferSelect;
export type InsertSeries = typeof series.$inferInsert;

export type SeriesSummary = Pick<
  SelectSeries,
  'name' | 'description' | 'status'
> & {
  postCount: number;
};
