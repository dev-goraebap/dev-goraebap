import {
  pgTable,
  integer,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { posts } from './posts.schema';
import { tags } from './tags.schema';

export const postTags = pgTable(
  'post_tags',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })],
);

export type SelectPostTag = typeof postTags.$inferSelect;
export type InsertPostTag = typeof postTags.$inferInsert;
