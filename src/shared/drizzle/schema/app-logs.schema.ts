import { sql } from 'drizzle-orm';
import {
  bigserial,
  index,
  inet,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const appLogs = pgTable(
  'app_logs',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    timestamp: timestamp({ withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    level: varchar({ length: 10 }).notNull(),
    message: text().notNull(),
    method: varchar({ length: 10 }),
    url: text(),
    statusCode: integer('status_code'),
    responseTime: integer('response_time'),
    userId: integer('user_id'),
    sessionId: varchar('session_id', { length: 128 }),
    ipAddress: inet('ip_address'),
    requestId: uuid('request_id'),
    errorMessage: text('error_message'),
    errorStack: text('error_stack'),
    metadata: jsonb(),
    tags: text().array().default(['']),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_app_logs_level').using(
      'btree',
      table.level.asc().nullsLast().op('text_ops'),
    ),
    index('idx_app_logs_level_timestamp').using(
      'btree',
      table.level.asc().nullsLast().op('timestamptz_ops'),
      table.timestamp.desc().nullsFirst().op('text_ops'),
    ),
    index('idx_app_logs_metadata').using(
      'gin',
      table.metadata.asc().nullsLast().op('jsonb_ops'),
    ),
    index('idx_app_logs_tags').using(
      'gin',
      table.tags.asc().nullsLast().op('array_ops'),
    ),
    index('idx_app_logs_timestamp').using(
      'btree',
      table.timestamp.desc().nullsFirst().op('timestamptz_ops'),
    ),
    index('idx_app_logs_user_id')
      .using('btree', table.userId.asc().nullsLast().op('int4_ops'))
      .where(sql`(user_id IS NOT NULL)`),
  ],
);

export type SelectAppLog = typeof appLogs.$inferSelect;
export type InsertAppLog = typeof appLogs.$inferInsert;
