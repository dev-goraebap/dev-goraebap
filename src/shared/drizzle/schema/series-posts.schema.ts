import {
  integer,
  pgTable,
  serial,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { posts } from './posts.schema';
import { series } from './series.schema';

export const seriesPosts = pgTable(
  'series_posts',
  {
    id: serial().primaryKey(),
    order: integer().default(999).notNull(),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
    seriesId: integer('series_id')
      .references(() => series.id, { onDelete: 'cascade' }).notNull(),
    postId: integer('post_id')
      .references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => [
    unique().on(table.seriesId, table.postId),
  ],
);

export type SelectSeriesPost = typeof seriesPosts.$inferSelect;
export type InsertSeriesPost = typeof seriesPosts.$inferInsert;
