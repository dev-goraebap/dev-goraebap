import {
  pgTable,
  integer,
  index,
  foreignKey,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { posts } from './posts.schema';
import { tags } from './tags.schema';

export const postTags = pgTable(
  'post_tags',
  {
    postId: integer('post_id').notNull(),
    tagId: integer('tag_id').notNull(),
  },
  (table) => [
    index('IDX_192ab488d1c284ac9abe2e3035').using(
      'btree',
      table.tagId.asc().nullsLast().op('int4_ops'),
    ),
    index('IDX_5df4e8dc2cb3e668b962362265').using(
      'btree',
      table.postId.asc().nullsLast().op('int4_ops'),
    ),
    foreignKey({
      columns: [table.postId],
      foreignColumns: [posts.id],
      name: 'FK_5df4e8dc2cb3e668b962362265d',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: 'FK_192ab488d1c284ac9abe2e30356',
    }),
    primaryKey({
      columns: [table.postId, table.tagId],
      name: 'PK_deee54a40024b7afc16d25684f8',
    }),
  ],
);

export type SelectPostTag = typeof postTags.$inferSelect;
export type InsertPostTag = typeof postTags.$inferInsert;
