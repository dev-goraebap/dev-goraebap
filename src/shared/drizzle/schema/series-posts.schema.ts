import {
  pgTable,
  serial,
  integer,
  timestamp,
  uniqueIndex,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { series } from './series.schema';
import { posts } from './posts.schema';

export const seriesPosts = pgTable(
  'series_posts',
  {
    id: serial().primaryKey().notNull(),
    order: integer().default(999).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    seriesId: integer('series_id'),
    postId: integer('post_id'),
  },
  (table) => [
    uniqueIndex('IDX_823166e73b133d4617427ce3c9').using(
      'btree',
      table.seriesId.asc().nullsLast().op('int4_ops'),
      table.postId.asc().nullsLast().op('int4_ops'),
    ),
    foreignKey({
      columns: [table.seriesId],
      foreignColumns: [series.id],
      name: 'FK_fbe5d292df00b06f7648dcdbc0a',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.postId],
      foreignColumns: [posts.id],
      name: 'FK_82763ddacb297fb7b7a907ecd97',
    }).onDelete('cascade'),
  ],
);

export type SelectSeriesPost = typeof seriesPosts.$inferSelect;
export type InsertSeriesPost = typeof seriesPosts.$inferInsert;
