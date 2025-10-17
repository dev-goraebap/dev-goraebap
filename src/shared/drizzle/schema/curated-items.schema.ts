import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { curatedSources } from './curated-sources.schema';

export const curatedItems = pgTable('curated_items', {
  id: serial().primaryKey(),
  title: varchar({ length: 500 }).notNull(),
  link: text().notNull().unique(),
  guid: text().notNull().unique(),
  snippet: text(),
  pubDate: timestamp('pub_date').notNull(),
  source: varchar({ length: 100 }).notNull(),
  sourceId: integer('source_id').references(() => curatedSources.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type SelectCuratedItem = typeof curatedItems.$inferSelect;
export type InsertCuratedItem = typeof curatedItems.$inferInsert;
