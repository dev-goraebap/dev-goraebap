import { Inject, Injectable } from "@nestjs/common";
import { eq, getTableColumns } from "drizzle-orm";

import { comments, DRIZZLE, DrizzleOrm, posts } from "src/shared/drizzle";

@Injectable()
export class CommentQueryService {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm
  ) {}

  async getPostComments(postSlug: string) {
    return await this.drizzle
      .select(getTableColumns(comments))
      .from(comments)
      .leftJoin(posts, eq(posts.id, comments.postId))
      .where(eq(posts.slug, postSlug))
      .orderBy(comments.createdAt);
  }
}