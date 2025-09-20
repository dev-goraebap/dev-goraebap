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
  createdAt: timestamp('created_at', { mode: 'string' })
    .defaultNow()
    .notNull(),
  postId: integer('post_id')
    .references(() => posts.id, { onDelete: 'cascade' }),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
  avatarNo: integer('avatar_no').notNull(),
});

export type SelectComment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
