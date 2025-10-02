import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, getTableColumns, like, lt, SQL, sql } from 'drizzle-orm';
import { R2PathHelper } from 'src/shared/cloudflare-r2';

import { comments, DrizzleContext, getCommentCountSubquery, getThumbnailSubquery, posts, postTags, SelectPost, series, seriesPosts, tags } from 'src/shared/drizzle';
import { GetAdminPostsDto } from '../dto';
import { PaginationModel, PostReadModel, ThumbnailModel } from '../read-models';

@Injectable()
export class PostQueryService {

  async getPostsWithCursor(cursor?: { viewCount: number; publishedAt: Date }, sortBy: 'latest' | 'popular' = 'latest', limit: number = 5) {
    const thumbnailSubquery = getThumbnailSubquery();

    // 댓글 수 서브쿼리
    const commentSubquery = DrizzleContext.db()
      .select({
        postId: comments.postId,
        commentCount: count(comments.id).as('comment_count')
      })
      .from(comments)
      .groupBy(comments.postId)
      .as('c');

    // 태그 JSON 집계 서브쿼리
    const tagSubquery = DrizzleContext.db()
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
    const result = await DrizzleContext.db()
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

  async getPostsFromPagination(dto: GetAdminPostsDto): Promise<PaginationModel<PostReadModel>> {
    // 검색 조건 설정
    const whereCondition: SQL[] = [];
    if (dto.search) {
      whereCondition.push(like(posts.title, `%${dto.search}%`));
    }
    if (dto.isPublishedYn) {
      whereCondition.push(eq(posts.isPublishedYn, dto.isPublishedYn));
    }
    if (dto.postType) {
      whereCondition.push(eq(posts.postType, dto.postType));
    }

    // 정렬 설정
    const orderCondition = dto.orderBy === 'ASC'
      ? asc(posts[dto.orderKey])
      : desc(posts[dto.orderKey]);

    const offset = (dto.page - 1) * dto.perPage;

    const thumbnailSubquery = getThumbnailSubquery();
    const commentCountSubquery = getCommentCountSubquery();
    const postQuery = await DrizzleContext.db()
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
      .where(whereCondition.length ? and(...whereCondition) : undefined)
      .orderBy(orderCondition)
      .limit(dto.perPage)
      .offset(offset);

    // 총 개수 쿼리
    const countQuery = DrizzleContext.db()
      .select({ count: count() })
      .from(posts)
      .where(whereCondition.length ? and(...whereCondition) : undefined);

    const [rawPosts, rawTotal] = await Promise.all([
      postQuery,
      countQuery
    ]);
    const total = rawTotal[0].count;

    const postReadModels: PostReadModel[] = rawPosts.map(
      x => this.getPostReadModel(x, x.file)
    );
    return PaginationModel.with(postReadModels, {
      page: dto.page,
      perPage: dto.perPage,
      total
    });
  }

  async getPostDetailById(id: number) {
    const whereCondition = eq(posts.id, id);
    return this.getPostDetail(whereCondition);
  }

  async getPostDetailBySlug(slug: string) {
    const whereCondition = eq(posts.slug, slug);
    return this.getPostDetail(whereCondition);
  }

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

    const thumbnailSubquery = getThumbnailSubquery();
    const commentCountSubquery = getCommentCountSubquery();
    const postList = await DrizzleContext.db()
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
        const url = R2PathHelper.getPublicUrl(x.file.key);
        const thumbnailModel = ThumbnailModel.from(url, x.file.metadata);
        return PostReadModel.from(x, thumbnailModel);
      }
      return PostReadModel.from(x);
    });
  }

  // ---------------------------------------------------------------------------
  // 공용기능
  // ---------------------------------------------------------------------------

  private async getPostDetail(addedWhereCondition: SQL) {
    const thumbnailSubquery = getThumbnailSubquery();
    const commentCountSubquery = getCommentCountSubquery();
    const [rawPost] = await DrizzleContext.db()
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
        addedWhereCondition,
      ));
    if (!rawPost) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return this.getPostReadModel(rawPost, rawPost.file);
  }

  private getPostReadModel(x: SelectPost, file: { key: string; metadata: string } | null) {
    if (file) {
      const url = R2PathHelper.getPublicUrl(file.key);
      const thumbnailModel = ThumbnailModel.from(url, file.metadata);
      return PostReadModel.from(x, thumbnailModel);
    }
    return PostReadModel.from(x);
  }
}


