import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  foreignKey,
  unique,
} from 'drizzle-orm/pg-core';
import { posts } from './posts.schema';

export const comments = pgTable(
  'comments',
  {
    id: serial().primaryKey().notNull(),
    requestId: varchar('request_id', { length: 255 }).notNull(),
    nickname: varchar({ length: 50 }).notNull(),
    comment: varchar({ length: 1000 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    postId: integer('post_id'),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    avatarNo: integer('avatar_no').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.postId],
      foreignColumns: [posts.id],
      name: 'FK_259bf9825d9d198608d1b46b0b5',
    }).onDelete('cascade'),
    unique('UQ_1de549e1e015a53856120e1398f').on(table.requestId),
  ],
);

export type SelectComment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
