import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { and, asc, desc, eq, getTableColumns, sql, SQL } from "drizzle-orm";
import { PostModel, ThumbnailModel } from "src/app/_concern";

import { CloudflareR2Service } from "src/shared/cloudflare-r2";
import { comments, DRIZZLE, DrizzleOrm, getThumbnailSubquery, posts, series, seriesPosts } from "src/shared/drizzle";

@Injectable()
export class PostQueryService {

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly r2Service: CloudflareR2Service
  ) { }

  async getSeriesPosts(dto: { seriesId?: number; seriesSlug?: string; }) {
    let whereCondition: SQL | undefined;
    if (dto.seriesId) {
      whereCondition = and(
        eq(seriesPosts.seriesId, dto.seriesId),
        eq(posts.isPublishedYn, 'Y')
      );
    } else if (dto.seriesSlug) {
      whereCondition = and(
        eq(series.slug, dto.seriesSlug),
        eq(posts.isPublishedYn, 'Y')
      );
    } else {
      throw new BadRequestException('아이디 또는 슬러그가 입력되지 않았습니다.');
    }

    const thumbnailSubquery = getThumbnailSubquery(this.drizzle);
    const commentCountSubquery = this.getCommentCountQueryFn();
    const postList = await this.drizzle
      .select({
        ...getTableColumns(posts),
        seriesPostId: seriesPosts.id,
        seriesSlug: series.slug,
        ...thumbnailSubquery.columns,
        ...commentCountSubquery.columns
      })
      .from(seriesPosts)
      .innerJoin(series, eq(series.id, seriesPosts.seriesId))
      .innerJoin(posts, eq(posts.id, seriesPosts.postId))
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'post'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${posts.id} AS TEXT)`)
      ))
      .leftJoin(commentCountSubquery.qb, eq(commentCountSubquery.qb.postId, posts.id))
      .where(whereCondition)
      .orderBy(asc(seriesPosts.order), desc(seriesPosts.createdAt));

    return postList.map(x => {
      if (x.file) {
        const url = this.r2Service.getPublicUrl(x.file.key);
        const thumbnailModel = ThumbnailModel.from(url, x.file.metadata);
        return PostModel.from(x, thumbnailModel);
      }
      return PostModel.from(x);
    });
  }

  private getCommentCountQueryFn() {
    const qb = this.drizzle
      .select({
        postId: comments.postId,
        commentCount: sql<number>`COALESCE(COUNT(${comments.id}), 0)`.as('comment_count')
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
}