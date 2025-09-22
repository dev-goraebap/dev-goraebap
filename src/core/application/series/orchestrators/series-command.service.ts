import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, eq, ne } from 'drizzle-orm';

import { UserEntity } from 'src/core/infrastructure/entities';
import { DRIZZLE, DrizzleOrm, SelectSeriesPost, series, seriesPosts } from 'src/shared/drizzle';
import { AttachmentSharedService, PostSharedService, UpdatePublishDto } from '../../_concern';
import { CreateSeriesDto, UpdateSeriesDto } from '../dto/create-or-update-series.dto';

@Injectable()
export class SeriesCommandService {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly attachmentSharedService: AttachmentSharedService,
    private readonly postsSharedService: PostSharedService
  ) { }

  // -------------------------------------------------
  // 시리즈 관리
  // -------------------------------------------------

  async createSeries(user: UserEntity, dto: CreateSeriesDto) {
    return await this.drizzle.transaction(async (tx) => {
      // 1. 시리즈 이름 중복 검증
      await this.validateSeriesNameUniqueness(dto.name);

      // 2. 시리즈 생성
      const [createdSeries] = await tx
        .insert(series)
        .values({
          userId: user.id,
          ...dto,
          publishedAt: dto.publishedAt.toISOString()
        })
        .returning();

      // 3. 썸네일 첨부 (optional)
      if (dto.thumbnailBlobId) {
        await this.attachmentSharedService.createThumbnailAttachment(
          dto.thumbnailBlobId,
          createdSeries.id.toString(),
          'series',
          tx,
        );
      }
      return createdSeries;
    });
  }

  async updateSeries(seriesId: number, dto: UpdateSeriesDto) {
    return await this.drizzle.transaction(async (tx) => {
      // 1. 기존 시리즈 조회 및 검증
      const existingSeries = await tx.query.series.findFirst({
        where: eq(series.id, seriesId)
      });

      if (!existingSeries) {
        throw new BadRequestException('시리즈를 찾을 수 없습니다.');
      }

      // 2. 시리즈 이름 중복 검증 (이름이 변경된 경우에만)
      if (dto.name && dto.name !== existingSeries.name) {
        await this.validateSeriesNameUniqueness(dto.name, seriesId);
      }

      // 3. 시리즈 기본 정보 업데이트
      const [updatedSeries] = await tx
        .update(series)
        .set({
          ...dto,
          publishedAt: dto.publishedAt?.toISOString()
        })
        .where(eq(series.id, seriesId))
        .returning();

      // 4. 썸네일 업데이트 (optional)
      if (dto.thumbnailBlobId) {
        await this.attachmentSharedService.updateThumbnailAttachment(
          dto.thumbnailBlobId,
          updatedSeries.id.toString(),
          'series',
          tx,
        );
      }

      return updatedSeries;
    });
  }

  async updatePublish(id: number, dto: UpdatePublishDto) {
    const seriesItem = await this.drizzle.query.series.findFirst({
      where: eq(series.id, id)
    });
    if (!seriesItem) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    // TODO: 예외처리 필요
    await this.drizzle
      .update(series)
      .set({
        ...seriesItem,
        isPublishedYn: dto.isPublishedYn,
      })
      .where(eq(series.id, id));
  }

  async updatePostOrders(items: { id: number; order: number }[]) {
    await this.drizzle.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(seriesPosts)
          .set({ order: item.order })
          .where(eq(seriesPosts.id, item.id));
      }
    });
  }

  async destroySeries(seriesId: number) {
    await this.drizzle.transaction(async (tx) => {
      // 1. 기존 시리즈 조회 및 검증
      const existingSeries = await tx.query.series.findFirst({
        where: eq(series.id, seriesId)
      });
      if (!existingSeries) {
        throw new BadRequestException('시리즈를 찾을 수 없습니다.');
      }

      // 2. 관련된 모든 첨부 삭제
      await this.attachmentSharedService.deleteAllAttachments(seriesId.toString(), 'series', tx);

      // 3. 시리즈 삭제
      await tx.delete(series).where(eq(series.id, seriesId));
    });
  }

  // -------------------------------------------------
  // 시리즈-포스트 관리
  // -------------------------------------------------

  async addPostToSeries(seriesId: number, postId: number) {
    // 1. 시리즈 존재 확인
    const seriesItem = await this.drizzle.query.series.findFirst({
      where: eq(series.id, seriesId)
    })
    if (!seriesItem) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    // 2. 포스트 존재 확인
    const post = await this.postsSharedService.findById(postId);
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }

    // 3. 중복 관계 확인
    const hasExistingRelation = await this.findPostRelation(seriesId, postId);
    if (hasExistingRelation) {
      throw new BadRequestException('이미 시리즈에 포함된 게시물입니다.');
    }

    // 4. 관계 생성
    await this.drizzle
      .insert(seriesPosts)
      .values({
        postId: post.id,
        seriesId: seriesItem.id,
        order: 999
      });
  }

  async removePostFromSeries(seriesId: number, postId: number) {
    // 1. 관계 존재 확인
    const hasRelation = await this.findPostRelation(seriesId, postId);
    if (!hasRelation) {
      throw new BadRequestException('시리즈의 게시물을 찾을 수 없습니다.');
    }

    // 2. 관계 제거
    await this.drizzle
      .delete(seriesPosts)
      .where(eq(seriesPosts.id, hasRelation.id))
  }

  // -------------------------------------------------
  // PRIVATE
  // -------------------------------------------------

  private async validateSeriesNameUniqueness(name: string, excludeId?: number): Promise<void> {
    const whereCondition = excludeId
      ? and(eq(series.name, name), ne(series.id, excludeId))
      : eq(series.name, name);

    const existingSeries = await this.drizzle.query.series.findFirst({
      where: whereCondition
    });

    if (existingSeries) {
      throw new BadRequestException('이미 사용 중인 시리즈 이름입니다.');
    }
  }

  private async findPostRelation(seriesId: number, postId: number): Promise<SelectSeriesPost | undefined> {
    return await this.drizzle.query.seriesPosts.findFirst({
      where: and(
        eq(seriesPosts.seriesId, seriesId),
        eq(seriesPosts.postId, postId)
      )
    });
  }
}
