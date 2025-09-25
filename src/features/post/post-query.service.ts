import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, eq, getTableColumns, sql } from "drizzle-orm";

import { PostModel, ThumbnailModel } from "src/app/_concern";
import { CloudflareR2Service } from "src/shared/cloudflare-r2";
import { DRIZZLE, DrizzleOrm, getThumbnailSubquery, posts } from "src/shared/drizzle";
import { getCommentCountSubquery } from "../comment";

@Injectable()
export class PostQueryService {

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly r2Service: CloudflareR2Service
  ) { }

  async getPostDetail(slug: string) {
    const thumbnailSubquery = getThumbnailSubquery(this.drizzle);
    const commentCountSubquery = getCommentCountSubquery(this.drizzle);
    const [rawPost] = await this.drizzle
      .select({
        ...getTableColumns(posts),
        ...thumbnailSubquery.columns,
        ...commentCountSubquery.columns
      })
      .from(posts)
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'post'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${posts.id} AS TEXT)`),
      ))
      .leftJoin(commentCountSubquery.qb, eq(commentCountSubquery.qb.postId, posts.id))
      .where(and(
        eq(posts.isPublishedYn, 'Y'),
        eq(posts.slug, slug),
      ));

    if (!rawPost) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    if (rawPost.file) {
      const url = this.r2Service.getPublicUrl(rawPost.file.key);
      const thumbnailModel = ThumbnailModel.from(url, rawPost.file.metadata);
      return PostModel.from(rawPost, thumbnailModel);
    }
    return PostModel.from(rawPost);
  }
}