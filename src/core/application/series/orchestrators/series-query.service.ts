import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, getTableColumns, like, SQL, sql } from 'drizzle-orm';

import { GetAdminSeriesDto } from 'src/core/infrastructure/dto';
import { CloudflareR2Service } from 'src/core/infrastructure/services';
import { DRIZZLE, DrizzleOrm, getThumbnailSubquery, series, seriesPosts } from 'src/shared/drizzle';
import { PaginationModel, ThumbnailModel } from '../../_concern';
import { SeriesModel } from '../view-models';

@Injectable()
export class SeriesQueryService {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly r2Service: CloudflareR2Service
  ) { }

  // -------------------------------------------------
  // 관리자 조회
  // -------------------------------------------------

  async getAdminSeriesList(dto: GetAdminSeriesDto): Promise<PaginationModel<SeriesModel>> {
    // 동적 조건 처리
    const whereConditions: SQL[] = [];
    if (dto.search) {
      whereConditions.push(like(series.name, `%${dto.search}%`));
    }
    if (dto.status) {
      whereConditions.push(eq(series.status, dto.status));
    }
    if (dto.isPublishedYn) {
      whereConditions.push(eq(series.isPublishedYn, dto.isPublishedYn));
    }
    const whereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // 정렬 설정
    const orderCondition = dto.orderBy === 'ASC'
      ? asc(series[dto.orderKey])
      : desc(series[dto.orderKey]);

    // 썸네일 공용 서브쿼리
    const thumbnailSubquery = getThumbnailSubquery(this.drizzle);

    // 시리즈별 게시물 개수 서브쿼리
    const postCountSubquery = this.getSeriesPostCountSubquery();

    // 데이터 쿼리
    const dataQuery = this.drizzle
      .select({
        ...getTableColumns(series),
        ...postCountSubquery.columns,
        ...thumbnailSubquery.columns
      })
      .from(series)
      .leftJoin(postCountSubquery.qb, eq(postCountSubquery.qb.seriesId, series.id))
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'series'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${series.id} AS TEXT)`),
      ))
      .where(whereCondition)
      .orderBy(orderCondition)
      .limit(dto.perPage)
      .offset((dto.page - 1) * dto.perPage);

    // 전체 페이지 쿼리
    const countQuery = this.drizzle.select({ count: count() })
      .from(series)
      .where(whereCondition);

    // 병렬 처리
    const [data, countResult] = await Promise.all([
      dataQuery,
      countQuery
    ]);

    // 뷰모델로 변경
    const items = data.map(x => this.getSeriesModel(x));

    // 페이지네이션으로 감싸기
    return PaginationModel.with(items, {
      page: dto.page,
      perPage: dto.perPage,
      total: countResult[0].count
    });
  }

  // -------------------------------------------------
  // 관리자, 일반 공용 조회
  // -------------------------------------------------

  async getSeriesItem(dto: { id?: number; slug?: string; }): Promise<SeriesModel> {
    let whereCondition: SQL | undefined;
    if (dto.id) {
      whereCondition = eq(series.id, dto.id);
    } else if (dto.slug) {
      whereCondition = eq(series.slug, dto.slug);
    } else {
      throw new BadRequestException('아이디 또는 슬러그가 입력되지 않았습니다.');
    }

    // 썸네일 정보 서브쿼리
    const thumbnailSubquery = getThumbnailSubquery(this.drizzle);

    // 시리즈별 게시물 개수 서브쿼리
    const postCountSubQuery = this.getSeriesPostCountSubquery();

    const [seriesItem] = await this.drizzle
      .select({
        ...getTableColumns(series),
        ...thumbnailSubquery.columns,
        ...postCountSubQuery.columns
      })
      .from(series)
      .leftJoin(postCountSubQuery.qb, eq(postCountSubQuery.qb.seriesId, series.id))
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'series'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${series.id} AS TEXT)`)
      ))
      .where(whereCondition);
    if (!seriesItem) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    return this.getSeriesModel(seriesItem);
  }

  // -------------------------------------------------
  // 일반 조회
  // -------------------------------------------------

  async getSeriesList(): Promise<SeriesModel[]> {
    const thumbnailSubquery = getThumbnailSubquery(this.drizzle);
    const postCountSubquery = this.getSeriesPostCountSubquery();
    const seriesList = await this.drizzle
      .select({
        ...getTableColumns(series),
        ...postCountSubquery.columns,
        ...thumbnailSubquery.columns
      })
      .from(series)
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'series'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${series.id} AS TEXT)`)
      ))
      .leftJoin(postCountSubquery.qb, eq(postCountSubquery.qb.seriesId, series.id))
      .where(eq(series.isPublishedYn, 'Y'))
      .orderBy(desc(series.createdAt));

    return seriesList.map(x => this.getSeriesModel(x));
  }

  async getSeriesPost(postSlug: string, seriesSlug: string) {
    // const qb = this.postRepository
    //   .createQueryBuilder('post')
    //   .leftJoinAndSelect('post.tags', 'tag')
    //   .leftJoinAndSelect('post.seriesPosts', 'seriesPost')
    //   .leftJoinAndSelect('seriesPost.series', 'series');

    // AttachmentQueryHelper.withAttachments(qb, 'post');

    // qb.where("post.isPublishedYn = 'Y'");
    // qb.andWhere('post.slug = :postSlug', { postSlug });
    // qb.andWhere('series.slug = :seriesSlug', { seriesSlug });

    // const result = await qb.getOne();

    // console.log(result);

    // if (!result) {
    //   throw new NotFoundException('게시물을 찾을 수 없습니다.');
    // }

    // const currentSeriesPost = seriesSlug
    //   ? result.seriesPosts.find((sp) => sp.series.slug === seriesSlug)
    //   : result.seriesPosts[0];

    // if (!currentSeriesPost) {
    //   throw new NotFoundException('시리즈 포스트를 찾을 수 없습니다.');
    // }

    // const [prevPost, nextPost] = await Promise.all([
    //   this.getPrevPost(currentSeriesPost.order, currentSeriesPost.createdAt, currentSeriesPost.series.id, result.id),
    //   this.getNextPost(currentSeriesPost.order, currentSeriesPost.createdAt, currentSeriesPost.series.id, result.id),
    // ]);

    // return {
    //   post: result,
    //   prevPost,
    //   nextPost,
    // };
  }

  private async getPrevPost(currentOrder: number, currentCreatedAt: Date, seriesId: number, currentPostId: number) {
    // const result = await this.seriesPostRepository
    //   .createQueryBuilder('seriesPost')
    //   .leftJoinAndSelect('seriesPost.post', 'post')
    //   .leftJoinAndSelect('seriesPost.series', 'series')
    //   .where("post.isPublishedYn = 'Y'")
    //   .andWhere('seriesPost.series.id = :seriesId', { seriesId })
    //   .andWhere('post.id != :currentPostId', { currentPostId })
    //   .andWhere(
    //     new Brackets((qb) => {
    //       qb.where('seriesPost.order < :currentOrder', { currentOrder }).orWhere(
    //         'seriesPost.order = :currentOrder AND seriesPost.createdAt < :currentCreatedAt',
    //         {
    //           currentOrder,
    //           currentCreatedAt,
    //         },
    //       );
    //     }),
    //   )
    //   .orderBy('seriesPost.order', 'DESC')
    //   .addOrderBy('seriesPost.createdAt', 'DESC')
    //   .getOne();

    // return result?.post;
  }

  private async getNextPost(currentOrder: number, currentCreatedAt: Date, seriesId: number, currentPostId: number) {
    // const result = await this.seriesPostRepository
    //   .createQueryBuilder('seriesPost')
    //   .leftJoinAndSelect('seriesPost.post', 'post')
    //   .leftJoinAndSelect('seriesPost.series', 'series')
    //   .where("post.isPublishedYn = 'Y'")
    //   .andWhere('seriesPost.series.id = :seriesId', { seriesId })
    //   .andWhere('post.id != :currentPostId', { currentPostId })
    //   .andWhere(
    //     new Brackets((qb) => {
    //       qb.where('seriesPost.order > :currentOrder', { currentOrder }).orWhere(
    //         'seriesPost.order = :currentOrder AND seriesPost.createdAt > :currentCreatedAt',
    //         {
    //           currentOrder,
    //           currentCreatedAt,
    //         },
    //       );
    //     }),
    //   )
    //   .orderBy('seriesPost.order', 'ASC')
    //   .addOrderBy('seriesPost.createdAt', 'ASC')
    //   .getOne();

    // return result?.post;
  }

  // -------------------------------------------------
  // PRIVATE
  // -------------------------------------------------

  private getSeriesModel(series: any) {
    if (series.file) {
      const url = this.r2Service.getPublicUrl(series.file?.key);
      const thumbnailModel = ThumbnailModel.from(url, series.file?.metadata);
      return SeriesModel.from(series, thumbnailModel);
    }
    return SeriesModel.from(series);
  }

  // 시리즈별 게시물 개수 조회 서브쿼리
  private getSeriesPostCountSubquery() {
    const qb = this.drizzle
      .select({
        seriesId: seriesPosts.seriesId,
        postCount: count().as('postCount')
      })
      .from(seriesPosts)
      .groupBy(seriesPosts.seriesId)
      .as('sp');

    return {
      qb,
      columns: {
        postCount: qb.postCount
      },
    } as const;
  }
}