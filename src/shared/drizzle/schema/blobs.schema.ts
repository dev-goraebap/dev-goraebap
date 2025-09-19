import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

export const blobs = pgTable(
  'blobs',
  {
    id: serial().primaryKey().notNull(),
    key: varchar({ length: 255 }).notNull(),
    filename: varchar({ length: 255 }).notNull(),
    contentType: varchar('content_type', { length: 100 }).notNull(),
    serviceName: varchar('service_name', { length: 50 }).notNull(),
    byteSize: integer('byte_size').notNull(),
    checksum: varchar({ length: 255 }).notNull(),
    createdBy: varchar('created_by', { length: 100 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    metadata: text().default('{}').notNull(),
  },
  (table) => [
    unique('UQ_c4f1b1851cdf6d548a0ee9ac723').on(table.key),
    unique('UQ_febe111f2b2e443015faaa78f97').on(table.checksum),
  ],
);

export type SelectBlob = typeof blobs.$inferSelect;
export type InsertBlob = typeof blobs.$inferInsert;
