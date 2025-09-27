import { count } from "drizzle-orm";
import { comments, DrizzleOrm } from "src/shared/drizzle";

export function getCommentCountSubquery(drizzle: DrizzleOrm) {
  const qb = drizzle
    .select({
      postId: comments.postId,
      commentCount: count(comments.id).as('comment_count')
    })
    .from(comments)
    .groupBy(comments.postId)
    .as('c');

  return {
    qb,
    columns: {
      commentCount: qb.commentCount
    }
  }
}