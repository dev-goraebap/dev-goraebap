import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

const publishedYnEnum = pgEnum('published_yn', ['Y', 'N']);

export const series = pgTable('series', {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
  description: varchar({ length: 1000 }),
  status: varchar({ length: 20 }).default('PLAN').notNull(), // PLAN, PROGRESS, COMPLETE
  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' }).notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  publishedAt: timestamp('published_at')
    .defaultNow()
    .notNull(),
  isPublishedYn: publishedYnEnum('is_published_yn').default('N').notNull(),
});

export type SelectSeries = typeof series.$inferSelect;
export type InsertSeries = typeof series.$inferInsert;

export type SeriesSummary = Pick<
  SelectSeries,
  'name' | 'description' | 'status'
> & {
  postCount: number;
};
