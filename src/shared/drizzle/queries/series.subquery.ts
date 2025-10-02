import { count } from "drizzle-orm";
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
      postCount: qb.postCount
    },
  } as const;
}