import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const activeYnEnum = pgEnum('active_yn', ['Y', 'N']);

export const curatedSources = pgTable('curated_sources', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  url: text().notNull(),
  isActiveYn: activeYnEnum('is_active_yn').default('Y').notNull(),
  fetchIntervalMinutes: integer('fetch_interval_minutes').default(60).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type SelectCuratedSource = typeof curatedSources.$inferSelect;
export type InsertCuratedSource = typeof curatedSources.$inferInsert;
