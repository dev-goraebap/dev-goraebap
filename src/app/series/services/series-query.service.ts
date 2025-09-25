import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { and, count, desc, eq, getTableColumns, sql } from "drizzle-orm";

import { SeriesModel, ThumbnailModel } from "src/app/_concern";
import { CloudflareR2Service } from "src/shared/cloudflare-r2";
import { DRIZZLE, DrizzleOrm, getThumbnailSubquery, series, seriesPosts } from "src/shared/drizzle";

@Injectable()
export class SeriesQueryService {

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly r2Service: CloudflareR2Service
  ) { }

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

  async getSeriesItem(slug: string): Promise<SeriesModel> {
    // 썸네일 정보 서브쿼리
    const thumbnailSubquery = getThumbnailSubquery(this.drizzle);

    // 시리즈별 게시물 개수 서브쿼리
    const postCountSubQuery = this.getSeriesPostCountSubquery();

    // 데이터 쿼리
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
      .where(eq(series.slug, slug));
    if (!seriesItem) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    return this.getSeriesModel(seriesItem);
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

  private getSeriesModel(series: any) {
    if (series.file) {
      const url = this.r2Service.getPublicUrl(series.file?.key);
      const thumbnailModel = ThumbnailModel.from(url, series.file?.metadata);
      return SeriesModel.from(series, thumbnailModel);
    }
    return SeriesModel.from(series);
  }
}