import { BadRequestException, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, getTableColumns, like, SQL, sql } from 'drizzle-orm';

import { GetAdminSeriesDto } from 'src/infra/dto/get-admin-series.dto';
import { R2PathHelper } from 'src/shared/cloudflare-r2';
import { DrizzleContext, getThumbnailSubquery, series, seriesPosts } from 'src/shared/drizzle';
import { PaginationModel, SeriesReadModel, ThumbnailModel } from '../read-models';

@Injectable()
export class SeriesQueryService {

  async getSeriesFromPagination(dto: GetAdminSeriesDto): Promise<PaginationModel<SeriesReadModel>> {
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
    const thumbnailSubquery = getThumbnailSubquery();

    // 시리즈별 게시물 개수 서브쿼리
    const postCountSubquery = this.getSeriesPostCountSubquery();

    // 데이터 쿼리
    const dataQuery = DrizzleContext.db()
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
    const countQuery = DrizzleContext.db().select({ count: count() })
      .from(series)
      .where(whereCondition);

    // 병렬 처리
    const [data, countResult] = await Promise.all([
      dataQuery,
      countQuery
    ]);

    // 뷰모델로 변경
    const items = data.map(x => this.getSeriesReadModel(x, x.file));

    // 페이지네이션으로 감싸기
    return PaginationModel.with(items, {
      page: dto.page,
      perPage: dto.perPage,
      total: countResult[0].count
    });
  }

  async getSeriesById(id: number): Promise<SeriesReadModel> {
    return this.getSeriesDetailQuery(eq(series.id, id));
  }

  async getSeriesBySlug(slug: string): Promise<SeriesReadModel> {
    return this.getSeriesDetailQuery(eq(series.slug, slug));
  }

  // -------------------------------------------------
  // 공통사용
  // -------------------------------------------------

  private async getSeriesDetailQuery(seriesCondition: SQL | undefined): Promise<SeriesReadModel> {
    // 썸네일 정보 서브쿼리
    const thumbnailSubquery = getThumbnailSubquery();

    // 시리즈별 게시물 개수 서브쿼리
    const postCountSubQuery = this.getSeriesPostCountSubquery();

    const [seriesItem] = await DrizzleContext.db()
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
      .where(seriesCondition);
    if (!seriesItem) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    return this.getSeriesReadModel(seriesItem, seriesItem.file);
  }

  private getSeriesReadModel(data: any, file: { key: string; metadata: string } | null): SeriesReadModel {
    if (file) {
      const url = R2PathHelper.getPublicUrl(file.key);
      const thumbnailModel = ThumbnailModel.from(url, file.metadata);
      return SeriesReadModel.from(data, thumbnailModel);
    }
    return SeriesReadModel.from(data);
  }

  // 시리즈별 게시물 개수 조회 서브쿼리
  private getSeriesPostCountSubquery() {
    const qb = DrizzleContext.db()
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