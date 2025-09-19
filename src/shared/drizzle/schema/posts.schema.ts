import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  foreignKey,
  unique,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const posts = pgTable(
  'posts',
  {
    id: serial().primaryKey().notNull(),
    slug: varchar({ length: 255 }).notNull(),
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
    userId: integer('user_id'),
    isPublishedYn: varchar('is_published_yn').default('N').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'FK_c4f9a7bd77b489e711277ee5986',
    }).onDelete('cascade'),
    unique('UQ_54ddf9075260407dcfdd7248577').on(table.slug),
  ],
);

export type SelectPost = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
