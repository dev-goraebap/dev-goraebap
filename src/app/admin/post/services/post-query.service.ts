import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, getTableColumns, lt, SQL, sql } from 'drizzle-orm';

import { GetAdminPostsDTO, GetFeedPostsDto } from 'src/core/infrastructure/dto';
import { PostRepository } from 'src/core/infrastructure/repositories';
import { CloudflareR2Service } from 'src/core/infrastructure/services';
import { comments, DRIZZLE, DrizzleOrm, getThumbnailSubquery, posts, postTags, series, seriesPosts, tags } from 'src/shared/drizzle';
import { ThumbnailModel } from '../../_concern';
import { PostModel } from '../view-models';

@Injectable()
export class PostQueryService {

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly r2Service: CloudflareR2Service,
    private readonly postRepository: PostRepository
  ) { }

  // ---------------------------------------------------------------------------
  // 일반 조회
  // ---------------------------------------------------------------------------

  async getAdminPostsListV2(cursor?: { viewCount: number; publishedAt: string }, sortBy: 'latest' | 'popular' = 'latest', limit: number = 5) {
    const thumbnailSubquery = getThumbnailSubquery(this.drizzle);

    // 댓글 수 서브쿼리
    const commentSubquery = this.drizzle
      .select({
        postId: comments.postId,
        commentCount: count(comments.id).as('comment_count')
      })
      .from(comments)
      .groupBy(comments.postId)
      .as('c');

    // 태그 JSON 집계 서브쿼리
    const tagSubquery = this.drizzle
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

    // 커서 조건 설정
    let whereConditions = and(
      eq(posts.postType, 'post'),
      eq(posts.isPublishedYn, 'Y')
    );

    if (cursor) {
      if (sortBy === 'popular') {
        whereConditions = and(
          whereConditions,
          and(
            lt(posts.viewCount, cursor.viewCount),
            lt(posts.publishedAt, cursor.publishedAt)
          )
        );
      } else {
        whereConditions = and(
          whereConditions,
          lt(posts.publishedAt, cursor.publishedAt)
        );
      }
    }

    // 정렬 설정
    const orderBy = sortBy === 'popular'
      ? [desc(posts.viewCount), desc(posts.publishedAt)]
      : [desc(posts.publishedAt)];

    // 메인 쿼리
    const result = await this.drizzle
      .select({
        id: posts.id,
        title: posts.title,
        summary: posts.summary,
        viewCount: posts.viewCount,
        publishedAt: posts.publishedAt,
        commentCount: sql<number>`COALESCE(${commentSubquery.commentCount}, 0)`.as('comment_count'),
        ...thumbnailSubquery.columns,
        tags: sql<any>`COALESCE(${tagSubquery.tags}, null)`.as('tags')
      })
      .from(posts)
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'post'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${posts.id} AS TEXT)`)
      ))
      .leftJoin(commentSubquery, eq(commentSubquery.postId, posts.id))
      .leftJoin(tagSubquery, eq(tagSubquery.postId, posts.id))
      .where(whereConditions)
      .orderBy(...orderBy)
      .limit(limit);

    return result;
  }

  async getFeedPosts(dto: GetFeedPostsDto) {
    return await this.postRepository.findFeedPosts(dto);
  }

  async getLatestPatchNotePost() {
    return await this.postRepository.findLatestPatchNote();
  }

  async getRandomSuggestedPosts(excludeSlug: string) {
    return await this.postRepository.findRandomSuggestedPosts(excludeSlug);
  }

  async getPublishedPostBySlug(slug: string) {
    // const post = await this.postRepository.findPublishedPostBySlug(slug)
    // if (!post) {
    //   throw new NotFoundException('게시물을 찾을 수 없습니다.');
    // }
    // return post;
  }

  // ---------------------------------------------------------------------------
  // 관리자 기능 조회
  // ---------------------------------------------------------------------------

  async getAdminPosts(dto: GetAdminPostsDTO) {
    return await this.postRepository.findAdminPosts(dto);
  }

  async getAdminPost(id: number) {
    // const post = await this.postRepository.findAdminPost(id);
    // if (!post) {
    //   throw new NotFoundException('게시물을 찾을 수 없습니다.');
    // }
    // return post;
  }

  async getAdminPostsExcludeSeriesId(seriesId: number, postTitle: string = '') {
    return this.postRepository.findAdminPostsExcludeSeriesId(seriesId, postTitle);
  }

  // ---------------------------------------------------------------------------
  // 관리자, 공용 기능 조회
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // 공용, 분리
  // ---------------------------------------------------------------------------

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


