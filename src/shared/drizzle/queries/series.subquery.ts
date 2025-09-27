import { count } from "drizzle-orm";
import { DrizzleOrm } from "../drizzle.module";
import { seriesPosts } from "../schema";

export function getSeriesPostCountSubquery(drizzle: DrizzleOrm) {
  const qb = drizzle
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