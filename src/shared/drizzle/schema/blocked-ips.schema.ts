import {
  index,
  inet,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const blockedIps = pgTable(
  'blocked_ips',
  {
    id: serial().primaryKey().notNull(),
    ipAddress: inet('ip_address').notNull(),
    reason: text(),
    blockedBy: varchar('blocked_by', { length: 20 })
      .default('manual')
      .notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    isActiveYn: varchar('is_active_yn', { length: 1 }).default('Y').notNull(),
  },
  (table) => [
    index('IDX_6ee844ff70dc272825209c1e9e').using(
      'btree',
      table.isActiveYn.asc().nullsLast().op('text_ops'),
      table.expiresAt.asc().nullsLast().op('text_ops'),
    ),
    uniqueIndex('IDX_d9a4a34a43215adb2f0c361283').using(
      'btree',
      table.ipAddress.asc().nullsLast().op('inet_ops'),
    ),
  ],
);

export type SelectBlockedIp = typeof blockedIps.$inferSelect;
export type InsertBlockedIp = typeof blockedIps.$inferInsert;
