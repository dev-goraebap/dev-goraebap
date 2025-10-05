import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { posts } from './posts.schema';

export const comments = pgTable('comments', {
  id: serial().primaryKey(),
  requestId: varchar('request_id', { length: 255 }).notNull().unique(),
  nickname: varchar({ length: 50 }).notNull(),
  comment: varchar({ length: 1000 }).notNull(),
  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),
  postId: integer('post_id')
    .references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  deletedAt: timestamp('deleted_at'),
  avatarNo: integer('avatar_no').notNull(),
});

export type SelectComment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
