import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const blobs = pgTable('blobs', {
  id: serial().primaryKey(),
  key: varchar({ length: 255 }).notNull().unique(),
  filename: varchar({ length: 255 }).notNull(),
  contentType: varchar('content_type', { length: 100 }).notNull(),
  serviceName: varchar('service_name', { length: 50 }).notNull(),
  byteSize: integer('byte_size').notNull(),
  checksum: varchar({ length: 255 }).notNull().unique(),
  createdBy: varchar('created_by', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' })
    .defaultNow()
    .notNull(),
  metadata: text().default('{}').notNull(),
});

export type SelectBlob = typeof blobs.$inferSelect;
export type InsertBlob = typeof blobs.$inferInsert;
