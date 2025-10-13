import { Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, getTableColumns, gt, like, lt, ne, or, SQL, sql } from 'drizzle-orm';
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
    return this.getDetailPostQuery(whereCondition);
  }

  async getPostDetailBySlug(slug: string) {
    const whereCondition = and(eq(posts.slug, slug), eq(posts.isPublishedYn, 'Y'));
    return this.getDetailPostQuery(whereCondition);
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

  async getOtherPatchNotes(currentPostSlug: string, limit: number = 5) {
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
        eq(posts.postType, 'patch-note'),
        eq(posts.isPublishedYn, 'Y'),
        ne(posts.slug, currentPostSlug)
      ))
      .orderBy(desc(posts.publishedAt))
      .limit(limit);

    return rawPosts.map(rawPost => this.getPostReadModel(rawPost, rawPost.file));
  }

  async getPostsBySeriesId(seriesId: number): Promise<PostReadModel[]> {
    return this.getSeriesPostsQuery(eq(series.id, seriesId));
  }

  async getPostsBySeriesSlug(seriesSlug: string): Promise<PostReadModel[]> {
    return this.getSeriesPostsQuery(eq(series.slug, seriesSlug));
  }

  async getPostsForSitemap() {
    return await DrizzleContext.db()
      .select()
      .from(posts)
      .where(eq(posts.isPublishedYn, 'Y'))
      .orderBy(desc(posts.publishedAt));
  }

  async getPostsExcludedFromSeries(seriesId: number, titleSearch?: string) {
    // 1. 해당 시리즈에 이미 포함된 포스트 ID 조회
    const includedPostIds = DrizzleContext.db()
      .select({ postId: seriesPosts.postId })
      .from(seriesPosts)
      .where(eq(seriesPosts.seriesId, seriesId));

    // 2. 조건 설정
    let whereCondition = and(
      eq(posts.postType, 'post'),
      sql`${posts.id} NOT IN ${includedPostIds}`
    );

    if (titleSearch) {
      whereCondition = and(
        whereCondition,
        like(posts.title, `%${titleSearch}%`)
      );
    }

    // 3. 포스트 조회
    const rawPosts = await DrizzleContext.db()
      .select({
        id: posts.id,
        title: posts.title,
        isPublishedYn: posts.isPublishedYn,
      })
      .from(posts)
      .where(whereCondition)
      .orderBy(desc(posts.publishedAt))
      .limit(10);

    return rawPosts;
  }

  async getPrevPostInSeries(seriesSlug: string, currentPostSlug: string): Promise<PostReadModel | null> {
    return this.getAdjacentPostInSeries(seriesSlug, currentPostSlug, 'prev');
  }

  async getNextPostInSeries(seriesSlug: string, currentPostSlug: string): Promise<PostReadModel | null> {
    return this.getAdjacentPostInSeries(seriesSlug, currentPostSlug, 'next');
  }

  // ---------------------------------------------------------------------------
  // 공용기능
  // ---------------------------------------------------------------------------

  private async getAdjacentPostInSeries(
    seriesSlug: string,
    currentPostSlug: string,
    direction: 'prev' | 'next'
  ): Promise<PostReadModel | null> {
    const thumbnailSubquery = getThumbnailSubquery();

    // 현재 포스트의 order 조회
    const [currentPost] = await DrizzleContext.db()
      .select({ order: seriesPosts.order })
      .from(seriesPosts)
      .innerJoin(series, eq(series.id, seriesPosts.seriesId))
      .innerJoin(posts, eq(posts.id, seriesPosts.postId))
      .where(and(
        eq(series.slug, seriesSlug),
        eq(posts.slug, currentPostSlug)
      ));

    if (!currentPost) return null;

    // direction에 따른 조건 및 정렬 설정
    const orderCondition = direction === 'prev'
      ? gt(seriesPosts.order, currentPost.order)
      : lt(seriesPosts.order, currentPost.order);

    const orderBy = direction === 'prev'
      ? asc(seriesPosts.order)
      : desc(seriesPosts.order);

    // 인접 포스트 조회
    const [rawPost] = await DrizzleContext.db()
      .select({
        ...getTableColumns(posts),
        ...thumbnailSubquery.columns
      })
      .from(seriesPosts)
      .innerJoin(series, eq(series.id, seriesPosts.seriesId))
      .innerJoin(posts, eq(posts.id, seriesPosts.postId))
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'post'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${posts.id} AS TEXT)`)
      ))
      .where(and(
        eq(series.slug, seriesSlug),
        orderCondition
      ))
      .orderBy(orderBy)
      .limit(1);

    return rawPost ? this.getPostReadModel(rawPost, rawPost.file) : null;
  }

  private async getSeriesPostsQuery(seriesCondition: SQL | undefined): Promise<PostReadModel[]> {
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
      .where(and(seriesCondition, eq(posts.isPublishedYn, 'Y')))
      .orderBy(asc(seriesPosts.order), desc(seriesPosts.createdAt));

    return postList.map(x => this.getPostReadModel(x, x.file));
  }

  private async getDetailPostQuery(addedWhereCondition: SQL | undefined) {
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


