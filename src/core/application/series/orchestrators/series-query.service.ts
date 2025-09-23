import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { and, asc, count, desc, eq, getTableColumns, like, SQL, sql } from 'drizzle-orm';
import { Brackets, In, Repository } from 'typeorm';

import { GetAdminSeriesDto } from 'src/core/infrastructure/dto';
import { PostEntity, SeriesEntity, SeriesPostEntity } from 'src/core/infrastructure/entities';
import { SeriesRepository } from 'src/core/infrastructure/repositories';
import { CloudflareR2Service } from 'src/core/infrastructure/services';
import { AttachmentQueryHelper } from 'src/shared';
import { DRIZZLE, DrizzleOrm, SelectSeries, series, seriesPosts, thumbnailSubQueryFn } from 'src/shared/drizzle';
import { PaginationModel, ThumbnailModel } from '../../_concern';
import { AdminSeriesModel } from '../view-models';

@Injectable()
export class SeriesQueryService {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly r2Service: CloudflareR2Service,
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(SeriesPostEntity)
    private readonly seriesPostRepository: Repository<SeriesPostEntity>,
    private readonly customSeriesRepository: SeriesRepository
  ) { }

  // -------------------------------------------------
  // 관리자 조회
  // -------------------------------------------------

  async getAdminSeriesList(dto: GetAdminSeriesDto): Promise<PaginationModel<AdminSeriesModel>> {
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
    const thumbnailSubQuery = thumbnailSubQueryFn(this.drizzle);

    // 시리즈별 게시물 개수 조회 서브쿼리
    const seriesPostQuery = this.drizzle
      .select({
        seriesId: seriesPosts.seriesId,
        postCount: count().as('postCount')
      })
      .from(seriesPosts)
      .groupBy(seriesPosts.seriesId)
      .as('sp');

    // 데이터 쿼리
    const dataQuery = this.drizzle
      .select({
        ...getTableColumns(series),
        postCount: seriesPostQuery.postCount,
        file: {
          key: thumbnailSubQuery.key,
          metadata: thumbnailSubQuery.metadata
        }
      })
      .from(series)
      .leftJoin(seriesPostQuery, eq(seriesPostQuery.seriesId, series.id))
      .leftJoin(thumbnailSubQuery, and(
        eq(thumbnailSubQuery.recordType, 'series'),
        eq(thumbnailSubQuery.recordId, sql`CAST(${series.id} AS TEXT)`),
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

  async getAdminSeriesItem(seriesId: number): Promise<SelectSeries> {
    const thumbnailQuery = thumbnailSubQueryFn(this.drizzle);
    const [seriesItem] = await this.drizzle
      .select({
        ...getTableColumns(series),
        file: {
          key: thumbnailQuery.key,
          metadata: thumbnailQuery.metadata
        }
      })
      .from(series)
      .leftJoin(thumbnailQuery, and(
        eq(thumbnailQuery.recordType, 'series'),
        eq(thumbnailQuery.recordId, sql`CAST(${series.id} AS TEXT)`)
      ))
      .where(eq(series.id, seriesId));
    if (!seriesItem) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    return this.getSeriesModel(seriesItem);
  }

  async getSeriesList(): Promise<SeriesEntity[]> {
    const qb = this.seriesRepository.createQueryBuilder('series');
    qb.leftJoinAndSelect('series.seriesPosts', 'post');
    AttachmentQueryHelper.withAttachments(qb, 'series');

    qb.where("series.isPublishedYn = 'Y'");
    qb.orderBy('series.createdAt', 'DESC');

    return await qb.getMany();
  }

  async getSeries(slug: string): Promise<SeriesEntity | null> {
    const qb = this.seriesRepository.createQueryBuilder('series');
    AttachmentQueryHelper.withAttachments(qb, 'series');

    qb.where("series.isPublishedYn = 'Y'");
    qb.andWhere('series.slug = :slug', { slug });
    return await qb.getOne();
  }

  async getSeriesPosts(seriesSlug: string): Promise<PostEntity[]> {
    const qb = this.postRepository.createQueryBuilder('post');
    qb.leftJoinAndSelect('post.comments', 'comment');
    qb.leftJoinAndSelect('post.seriesPosts', 'seriesPost');
    qb.leftJoinAndSelect('seriesPost.series', 'series');
    AttachmentQueryHelper.withAttachments(qb, 'post');

    qb.where("post.isPublishedYn = 'Y'");
    qb.andWhere('series.slug = :seriesSlug', { seriesSlug });

    qb.orderBy('seriesPost.order', 'ASC');
    qb.addOrderBy('seriesPost.createdAt', 'DESC');

    return await qb.getMany();
  }

  async getSeriesPost(postSlug: string, seriesSlug: string) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.seriesPosts', 'seriesPost')
      .leftJoinAndSelect('seriesPost.series', 'series');

    AttachmentQueryHelper.withAttachments(qb, 'post');

    qb.where("post.isPublishedYn = 'Y'");
    qb.andWhere('post.slug = :postSlug', { postSlug });
    qb.andWhere('series.slug = :seriesSlug', { seriesSlug });

    const result = await qb.getOne();
    if (!result) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    const currentSeriesPost = seriesSlug
      ? result.seriesPosts.find((sp) => sp.series.slug === seriesSlug)
      : result.seriesPosts[0];

    if (!currentSeriesPost) {
      throw new NotFoundException('시리즈 포스트를 찾을 수 없습니다.');
    }

    const [prevPost, nextPost] = await Promise.all([
      this.getPrevPost(currentSeriesPost.order, currentSeriesPost.createdAt, currentSeriesPost.series.id, result.id),
      this.getNextPost(currentSeriesPost.order, currentSeriesPost.createdAt, currentSeriesPost.series.id, result.id),
    ]);

    return {
      post: result,
      prevPost,
      nextPost,
    };
  }

  async updatePostOrders(items: { id: number; order: number }[]): Promise<void> {
    const ids = items.map((item) => item.id);

    const relations = await this.seriesPostRepository.find({
      where: { id: In(ids) },
    });

    const updated = relations.map((relation) => {
      const newOrder = items.find((item) => item.id === relation.id)?.order ?? 999;
      return this.seriesPostRepository.create({ ...relation, order: newOrder });
    });

    await this.seriesPostRepository.save(updated);
  }

  private async getPrevPost(currentOrder: number, currentCreatedAt: Date, seriesId: number, currentPostId: number) {
    const result = await this.seriesPostRepository
      .createQueryBuilder('seriesPost')
      .leftJoinAndSelect('seriesPost.post', 'post')
      .leftJoinAndSelect('seriesPost.series', 'series')
      .where("post.isPublishedYn = 'Y'")
      .andWhere('seriesPost.series.id = :seriesId', { seriesId })
      .andWhere('post.id != :currentPostId', { currentPostId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('seriesPost.order < :currentOrder', { currentOrder }).orWhere(
            'seriesPost.order = :currentOrder AND seriesPost.createdAt < :currentCreatedAt',
            {
              currentOrder,
              currentCreatedAt,
            },
          );
        }),
      )
      .orderBy('seriesPost.order', 'DESC')
      .addOrderBy('seriesPost.createdAt', 'DESC')
      .getOne();

    return result?.post;
  }

  private async getNextPost(currentOrder: number, currentCreatedAt: Date, seriesId: number, currentPostId: number) {
    const result = await this.seriesPostRepository
      .createQueryBuilder('seriesPost')
      .leftJoinAndSelect('seriesPost.post', 'post')
      .leftJoinAndSelect('seriesPost.series', 'series')
      .where("post.isPublishedYn = 'Y'")
      .andWhere('seriesPost.series.id = :seriesId', { seriesId })
      .andWhere('post.id != :currentPostId', { currentPostId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('seriesPost.order > :currentOrder', { currentOrder }).orWhere(
            'seriesPost.order = :currentOrder AND seriesPost.createdAt > :currentCreatedAt',
            {
              currentOrder,
              currentCreatedAt,
            },
          );
        }),
      )
      .orderBy('seriesPost.order', 'ASC')
      .addOrderBy('seriesPost.createdAt', 'ASC')
      .getOne();

    return result?.post;
  }

  // -------------------------------------------------
  // PRIVATE
  // -------------------------------------------------

  private getSeriesModel(series: any) {
    if (series.file) {
      const url = this.r2Service.getPublicUrl(series.file?.key);
      const thumbnailModel = ThumbnailModel.from(url, series.file?.metadata);
      return AdminSeriesModel.from(series, thumbnailModel);
    }
    return AdminSeriesModel.from(series);
  }
}