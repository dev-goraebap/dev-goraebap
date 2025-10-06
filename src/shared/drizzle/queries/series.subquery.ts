import { count, sql } from "drizzle-orm";
import { DrizzleContext } from "../drizzle.context";
import { seriesPosts } from "../schema";

export function getSeriesPostCountSubquery() {
  const qb = DrizzleContext.db()
    .select({
      seriesId: seriesPosts.seriesId,
      postCount: count().as('postCount')
    })
    .from(seriesPosts)
    .groupBy(seriesPosts.seriesId)
    .as('sp');

  return {
    qb,
    columns: {
      postCount: sql`COALESCE(${qb.postCount}, 0)`.as('postCount')
    },
  } as const;
}