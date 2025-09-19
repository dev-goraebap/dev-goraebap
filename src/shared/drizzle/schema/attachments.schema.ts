import {
  foreignKey,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { blobs } from './blobs.schema';

export const attachments = pgTable(
  'attachments',
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    recordType: varchar('record_type', { length: 100 }).notNull(),
    recordId: varchar('record_id', { length: 100 }).notNull(),
    blobId: integer('blob_id').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.blobId],
      foreignColumns: [blobs.id],
      name: 'FK_2ed76e5e068bbf7ad4e5c4c7c5e',
    }),
  ],
);

export type SelectAttachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;
