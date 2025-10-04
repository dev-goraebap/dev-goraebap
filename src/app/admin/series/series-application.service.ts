import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { UpdatePublishDto } from 'src/app/_concern';
import { AttachmentEntity } from 'src/domain/media/attachment.entity';
import { SERIES_REPO, SeriesEntity, SeriesRepository } from 'src/domain/series';
import { DrizzleContext, posts, SelectSeriesPost, seriesPosts, UserId } from 'src/shared/drizzle';
import { CreateSeriesDto, UpdateSeriesDto } from './dto/create-or-update-series.dto';

@Injectable()
export class SeriesApplicationService {
  constructor(
    @Inject(SERIES_REPO)
    private readonly seriesRepository: SeriesRepository,
  ) { }

  // -------------------------------------------------
  // 시리즈 관리
  // -------------------------------------------------

  async createSeries(userId: UserId, dto: CreateSeriesDto) {
    return await DrizzleContext.transaction(async () => {
      // 1. 시리즈 이름 중복 검증
      const nameExists = await this.seriesRepository.checkNameExists(dto.name);
      if (nameExists) {
        throw new BadRequestException('이미 사용 중인 시리즈 이름입니다.');
      }

      // 2. 시리즈 생성
      const newSeries = SeriesEntity.create({
        userId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description || '',
        status: dto.status,
        isPublishedYn: dto.isPublishedYn as 'Y' | 'N',
        publishedAt: dto.publishedAt
      });

      const createdSeries = await this.seriesRepository.save(newSeries);

      // 3. 썸네일 첨부 (optional)
      if (dto.thumbnailBlobId) {
        await AttachmentEntity.createThumbnail(
          dto.thumbnailBlobId,
          createdSeries.id.toString(),
          'series'
        );
      }
      return createdSeries;
    });
  }

  async updateSeries(seriesId: number, dto: UpdateSeriesDto) {
    return await DrizzleContext.transaction(async () => {
      // 1. 기존 시리즈 조회 및 검증
      const existingSeries = await this.seriesRepository.findById(seriesId);
      if (!existingSeries) {
        throw new BadRequestException('시리즈를 찾을 수 없습니다.');
      }

      // 2. 시리즈 이름 중복 검증 (이름이 변경된 경우에만)
      if (dto.name && dto.name !== existingSeries.name) {
        const nameExists = await this.seriesRepository.checkNameExists(dto.name, seriesId);
        if (nameExists) {
          throw new BadRequestException('이미 사용 중인 시리즈 이름입니다.');
        }
      }

      // 3. 시리즈 기본 정보 업데이트
      const updatedSeries = existingSeries.update({
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        status: dto.status,
        isPublishedYn: dto.isPublishedYn as 'Y' | 'N' | undefined,
        publishedAt: dto.publishedAt
      });

      const savedSeries = await this.seriesRepository.save(updatedSeries);

      // 4. 썸네일 업데이트 (optional)
      if (dto.thumbnailBlobId) {
        await AttachmentEntity.updateThumbnail(
          dto.thumbnailBlobId,
          savedSeries.id.toString(),
          'series'
        );
      }

      return savedSeries;
    });
  }

  async updatePublish(id: number, dto: UpdatePublishDto) {
    const existingSeries = await this.seriesRepository.findById(id);
    if (!existingSeries) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    const updatedSeries = existingSeries.update({
      isPublishedYn: dto.isPublishedYn
    });

    await this.seriesRepository.save(updatedSeries);
  }

  async updatePostOrders(items: { id: number; order: number }[]) {
    await DrizzleContext.transaction(async () => {
      for (const item of items) {
        await DrizzleContext.db()
          .update(seriesPosts)
          .set({ order: item.order })
          .where(eq(seriesPosts.id, item.id));
      }
    });
  }

  async destroySeries(seriesId: number) {
    await DrizzleContext.transaction(async () => {
      // 1. 기존 시리즈 조회 및 검증
      const existingSeries = await this.seriesRepository.findById(seriesId);
      if (!existingSeries) {
        throw new BadRequestException('시리즈를 찾을 수 없습니다.');
      }

      // 2. 관련된 모든 첨부 삭제
      await AttachmentEntity.deleteAll(seriesId.toString(), 'series');

      // 3. 시리즈 삭제
      await this.seriesRepository.delete(seriesId);
    });
  }

  // -------------------------------------------------
  // 시리즈-포스트 관리
  // -------------------------------------------------

  async addPostToSeries(seriesId: number, postId: number) {
    // 1. 시리즈 존재 확인
    const seriesItem = await this.seriesRepository.findById(seriesId);
    if (!seriesItem) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    // 2. 포스트 존재 확인
    const post = await DrizzleContext.db().query.posts.findFirst({
      where: eq(posts.id, postId)
    });
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }

    // 3. 중복 관계 확인
    const hasExistingRelation = await this.findPostRelation(seriesId, postId);
    if (hasExistingRelation) {
      throw new BadRequestException('이미 시리즈에 포함된 게시물입니다.');
    }

    // 4. 관계 생성
    await DrizzleContext.db()
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
    await DrizzleContext.db()
      .delete(seriesPosts)
      .where(eq(seriesPosts.id, hasRelation.id))
  }

  // -------------------------------------------------
  // PRIVATE
  // -------------------------------------------------

  private async findPostRelation(seriesId: number, postId: number): Promise<SelectSeriesPost | undefined> {
    return await DrizzleContext.db().query.seriesPosts.findFirst({
      where: and(
        eq(seriesPosts.seriesId, seriesId),
        eq(seriesPosts.postId, postId)
      )
    });
  }
}
