import { count, eq, sql } from "drizzle-orm";
import { DrizzleContext } from "../drizzle.context";
import { posts, seriesPosts } from "../schema";

export function getSeriesPostCountSubquery() {
  const qb = DrizzleContext.db()
    .select({
      seriesId: seriesPosts.seriesId,
      postCount: count().as('postCount')
    })
    .from(seriesPosts)
    .innerJoin(posts, eq(posts.id, seriesPosts.postId))
    .where(eq(posts.isPublishedYn, 'Y'))
    .groupBy(seriesPosts.seriesId)
    .as('sp');

  return {
    qb,
    columns: {
      postCount: sql`COALESCE(${qb.postCount}, 0)`.as('postCount')
    },
  } as const;
}