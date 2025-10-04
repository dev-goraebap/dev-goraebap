import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, getTableColumns, like, lt, ne, or, SQL, sql } from 'drizzle-orm';
import { R2PathHelper } from 'src/shared/cloudflare-r2';

import { DrizzleContext, getCommentCountSubquery, getTagSubquery, getThumbnailSubquery, posts, postTags, SelectPost, series, seriesPosts, tags } from 'src/shared/drizzle';
import { GetAdminPostsDto, GetFeedPostsDto } from '../dto';
import { CursorPaginationModel, PaginationModel, PostReadModel, ThumbnailModel } from '../read-models';
import { withCursor } from '../read-models/with-cursor';

@Injectable()
export class PostQueryService {

  async getPostsWithCursor(dto: GetFeedPostsDto): Promise<CursorPaginationModel<PostReadModel>> {
    const { cursor, orderType, perPage, tag, postType } = dto;

    // 커서 조건 설정
    let whereConditions = and(
      eq(posts.postType, postType),
      eq(posts.isPublishedYn, 'Y')
    );

    // 태그 필터링
    if (tag) {
      const tagFilterSubquery = DrizzleContext.db()
        .select({ postId: postTags.postId })
        .from(postTags)
        .innerJoin(tags, eq(tags.id, postTags.tagId))
        .where(eq(tags.name, tag));

      whereConditions = and(
        whereConditions,
        sql`${posts.id} IN ${tagFilterSubquery}`
      );
    }

    if (cursor) {
      if (orderType === 'traffic') {
        whereConditions = and(
          whereConditions,
          or(
            lt(posts.viewCount, cursor.viewCount),
            and(
              eq(posts.viewCount, cursor.viewCount),
              lt(posts.publishedAt, cursor.publishedAt)
            )
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
    const orderBy = orderType === 'traffic'
      ? [desc(posts.viewCount), desc(posts.publishedAt)]
      : [desc(posts.publishedAt)];

    // 서브쿼리
    const thumbnailSubquery = getThumbnailSubquery();
    const commentSubquery = getCommentCountSubquery();
    const tagSubquery = getTagSubquery();

    // 메인 쿼리 - perPage + 1개 조회하여 hasMore 판단
    const rawPosts = await DrizzleContext.db()
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        summary: posts.summary,
        viewCount: posts.viewCount,
        publishedAt: posts.publishedAt,
        ...commentSubquery.columns,
        ...thumbnailSubquery.columns,
        ...tagSubquery.columns
      })
      .from(posts)
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'post'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${posts.id} AS TEXT)`)
      ))
      .leftJoin(commentSubquery.qb, eq(commentSubquery.qb.postId, posts.id))
      .leftJoin(tagSubquery.qb, eq(tagSubquery.qb.postId, posts.id))
      .where(whereConditions)
      .orderBy(...orderBy)
      .limit(perPage + 1);

    const postsWithReadModel: PostReadModel[] = rawPosts.map(x => this.getPostReadModel(x, x?.file));

    return withCursor(
      postsWithReadModel,
      perPage,
      (lastItem) => ({
        viewCount: lastItem.viewCount ?? 0,
        publishedAt: lastItem.publishedAt ?? new Date()
      })
    );
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
    const tagSubquery = getTagSubquery();
    const postQuery = await DrizzleContext.db()
      .select({
        ...getTableColumns(posts),
        ...thumbnailSubquery.columns,
        ...commentCountSubquery.columns,
        ...tagSubquery.columns
      })
      .from(posts)
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'post'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${posts.id} AS TEXT)`),
      ))
      .leftJoin(commentCountSubquery.qb, eq(commentCountSubquery.qb.postId, posts.id))
      .leftJoin(tagSubquery.qb, eq(tagSubquery.qb.postId, posts.id))
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

    const postReadModels: Partial<PostReadModel>[] = rawPosts.map(
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
    const whereCondition = and(eq(posts.slug, slug));
    return this.getPostDetail(whereCondition);
  }

  async getLatestPatchNotePost() {
    const thumbnailSubquery = getThumbnailSubquery();
    const [rawPost] = await DrizzleContext.db()
      .select({
        ...getTableColumns(posts),
        ...thumbnailSubquery.columns
      })
      .from(posts)
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'post'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${posts.id} AS TEXT)`)
      ))
      .where(and(
        eq(posts.postType, 'patch-note'),
        eq(posts.isPublishedYn, 'Y')
      ))
      .orderBy(desc(posts.publishedAt))
      .limit(1);

    if (!rawPost) {
      return null;
    }

    return this.getPostReadModel(rawPost, rawPost.file);
  }

  async getSuggestedPosts(currentPostSlug: string, limit: number = 3) {
    const thumbnailSubquery = getThumbnailSubquery();
    const rawPosts = await DrizzleContext.db()
      .select({
        ...getTableColumns(posts),
        ...thumbnailSubquery.columns
      })
      .from(posts)
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'post'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${posts.id} AS TEXT)`)
      ))
      .where(and(
        eq(posts.postType, 'post'),
        eq(posts.isPublishedYn, 'Y'),
        ne(posts.slug, currentPostSlug)
      ))
      .orderBy(sql`RANDOM()`)
      .limit(limit);

    return rawPosts.map(rawPost => this.getPostReadModel(rawPost, rawPost.file));
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

  async getPostsForSitemap() {
    return await DrizzleContext.db()
      .select()
      .from(posts)
      .where(eq(posts.isPublishedYn, 'Y'))
      .orderBy(desc(posts.publishedAt));
  }

  // ---------------------------------------------------------------------------
  // 공용기능
  // ---------------------------------------------------------------------------

  private async getPostDetail(addedWhereCondition: SQL | undefined) {
    const thumbnailSubquery = getThumbnailSubquery();
    const commentCountSubquery = getCommentCountSubquery();
    const tagSubquery = getTagSubquery();
    const [rawPost] = await DrizzleContext.db()
      .select({
        ...getTableColumns(posts),
        ...thumbnailSubquery.columns,
        ...commentCountSubquery.columns,
        ...tagSubquery.columns
      })
      .from(posts)
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'post'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${posts.id} AS TEXT)`),
      ))
      .leftJoin(commentCountSubquery.qb, eq(commentCountSubquery.qb.postId, posts.id))
      .leftJoin(tagSubquery.qb, eq(tagSubquery.qb.postId, posts.id))
      .where(addedWhereCondition);
    if (!rawPost) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return this.getPostReadModel(rawPost, rawPost.file);
  }

  private getPostReadModel(x: Partial<SelectPost>, file: { key: string; metadata: string } | null): PostReadModel {
    if (file) {
      const url = R2PathHelper.getPublicUrl(file.key);
      const thumbnailModel = ThumbnailModel.from(url, file.metadata);
      return PostReadModel.from(x, thumbnailModel);
    }
    return PostReadModel.from(x);
  }
}


