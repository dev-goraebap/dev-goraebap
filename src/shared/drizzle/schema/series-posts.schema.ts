import {
  pgTable,
  serial,
  integer,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { series } from './series.schema';
import { posts } from './posts.schema';

export const seriesPosts = pgTable(
  'series_posts',
  {
    id: serial().primaryKey(),
    order: integer().default(999).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    seriesId: integer('series_id')
      .references(() => series.id, { onDelete: 'cascade' }),
    postId: integer('post_id')
      .references(() => posts.id, { onDelete: 'cascade' }),
  },
  (table) => [
    unique().on(table.seriesId, table.postId),
  ],
);

export type SelectSeriesPost = typeof seriesPosts.$inferSelect;
export type InsertSeriesPost = typeof seriesPosts.$inferInsert;
