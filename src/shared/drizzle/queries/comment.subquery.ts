import { count, isNull } from "drizzle-orm";
import { comments, DrizzleContext } from "src/shared/drizzle";

export function getCommentCountSubquery() {
  const qb = DrizzleContext.db()
    .select({
      postId: comments.postId,
      commentCount: count(comments.id).as('comment_count')
    })
    .from(comments)
    .where(isNull(comments.deletedAt))
    .groupBy(comments.postId)
    .as('c');

  return {
    qb,
    columns: {
      commentCount: qb.commentCount
    }
  }
}