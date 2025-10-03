import { eq, sql } from "drizzle-orm";
import { DrizzleContext, postTags, tags } from "src/shared/drizzle";

export function getTagSubquery() {
  const qb = DrizzleContext.db()
    .select({
      postId: postTags.postId,
      tags: sql<any>`JSON_AGG(
        json_build_object(
          'id', ${tags.id},
          'name', ${tags.name}
        )
      )`.as('tags')
    })
    .from(postTags)
    .innerJoin(tags, eq(tags.id, postTags.tagId))
    .groupBy(postTags.postId)
    .as('t');

  return {
    qb,
    columns: {
      tags: qb.tags
    }
  }
}
