import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const publishedYnEnum = pgEnum('published_yn', ['Y', 'N']);

export const posts = pgTable('posts', {
  id: serial().primaryKey(),
  slug: varchar({ length: 255 }).notNull().unique(),
  title: varchar({ length: 255 }).notNull(),
  summary: varchar({ length: 500 }).notNull(),
  content: text().notNull(),
  postType: varchar('post_type', { length: 20 }).default('post').notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .defaultNow()
    .notNull(),
  publishedAt: timestamp('published_at', { mode: 'string' })
    .defaultNow()
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' }).notNull(),
  isPublishedYn: publishedYnEnum('is_published_yn').default('N').notNull(),
});

export type SelectPost = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
