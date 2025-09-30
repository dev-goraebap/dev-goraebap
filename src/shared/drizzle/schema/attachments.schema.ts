import {
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { blobs } from './blobs.schema';

export const attachments = pgTable('attachments', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  recordType: varchar('record_type', { length: 100 }).notNull(),
  recordId: varchar('record_id', { length: 100 }).notNull(),
  blobId: integer('blob_id')
    .notNull()
    .references(() => blobs.id),
  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),
});

export type SelectAttachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;
