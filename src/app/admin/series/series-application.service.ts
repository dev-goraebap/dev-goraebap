import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { AttachmentSharedService, PostsSharedService, UpdatePublishDto, UserEntity } from 'src/shared';
import { CreateSeriesDto, UpdateSeriesDto } from './dto/create-or-update-series.dto';
import { GetSeriesDto } from './dto/get-series.dto';
import { SeriesService } from './series.service';

@Injectable()
export class SeriesApplicationService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly attachmentSharedService: AttachmentSharedService,
    private readonly postsSharedService: PostsSharedService,
    private readonly seriesService: SeriesService,
  ) {}

  // -------------------------------------------------
  // 시리즈 조회
  // -------------------------------------------------

  async getSeriesList(dto: GetSeriesDto) {
    return this.seriesService.findSeriesList(dto);
  }

  async getSeriesItem(seriesId: number) {
    return this.seriesService.findSeriesItem(seriesId);
  }

  async getSeriesPosts(seriesId: number, postTitle: string) {
    return this.postsSharedService.getPostsExcludeBy(seriesId, postTitle);
  }

  // -------------------------------------------------
  // 시리즈 관리
  // -------------------------------------------------

  async createSeries(user: UserEntity, dto: CreateSeriesDto) {
    return await this.entityManager.transaction(async (m: EntityManager) => {
      // 1. 시리즈 이름 중복 검증
      await this.seriesService.validateSeriesNameUniqueness(dto.name);

      // 2. 시리즈 생성
      const series = await this.seriesService.createSeries(user, dto, m);

      // 3. 썸네일 첨부 (optional)
      if (dto.thumbnailBlobId) {
        await this.attachmentSharedService.createThumbnailAttachment(
          dto.thumbnailBlobId,
          series.id.toString(),
          'series',
          m,
        );
      }

      return series;
    });
  }

  async updateSeries(seriesId: number, dto: UpdateSeriesDto) {
    return await this.entityManager.transaction(async (m: EntityManager) => {
      // 1. 기존 시리즈 조회 및 검증
      const existingSeries = await this.seriesService.findById(seriesId);
      if (!existingSeries) {
        throw new BadRequestException('시리즈를 찾을 수 없습니다.');
      }

      // 2. 시리즈 이름 중복 검증 (이름이 변경된 경우에만)
      if (dto.name && dto.name !== existingSeries.name) {
        await this.seriesService.validateSeriesNameUniqueness(dto.name, seriesId);
      }

      // 3. 시리즈 기본 정보 업데이트
      const updatedSeries = await this.seriesService.updateSeries(existingSeries, dto, m);

      // 4. 썸네일 업데이트 (optional)
      if (dto.thumbnailBlobId) {
        await this.attachmentSharedService.updateThumbnailAttachment(
          dto.thumbnailBlobId,
          updatedSeries.id.toString(),
          'series',
          m,
        );
      }

      return updatedSeries;
    });
  }

  async updatePublish(id: number, dto: UpdatePublishDto) {
    return this.seriesService.updatePublish(id, dto);
  }

  async updatePostOrders(
    items: {
      id: number;
      order: number;
    }[],
  ) {
    return this.seriesService.updatePostOrders(items);
  }

  async destroySeries(seriesId: number) {
    await this.entityManager.transaction(async (m: EntityManager) => {
      // 1. 기존 시리즈 조회 및 검증
      const existingSeries = await this.seriesService.findById(seriesId);
      if (!existingSeries) {
        throw new BadRequestException('시리즈를 찾을 수 없습니다.');
      }

      // 2. 관련된 모든 첨부 삭제
      await this.attachmentSharedService.deleteAllAttachments(seriesId.toString(), 'series', m);

      // 3. 시리즈 삭제
      await m.remove(existingSeries);
    });
  }

  // -------------------------------------------------
  // 시리즈-포스트 관리
  // -------------------------------------------------

  async addPostToSeries(seriesId: number, postId: number) {
    // 1. 시리즈 존재 확인
    const series = await this.seriesService.findById(seriesId);
    if (!series) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    // 2. 포스트 존재 확인
    const post = await this.postsSharedService.findById(postId);
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }

    // 3. 중복 관계 확인
    const hasExistingRelation = await this.seriesService.findPostRelation(seriesId, postId);
    if (hasExistingRelation) {
      throw new BadRequestException('이미 시리즈에 포함된 게시물입니다.');
    }

    // 4. 관계 생성
    await this.seriesService.createRelation(series, post);
  }

  async removePostFromSeries(seriesId: number, postId: number) {
    // 1. 관계 존재 확인
    const hasRelation = await this.seriesService.findPostRelation(seriesId, postId);
    if (!hasRelation) {
      throw new BadRequestException('시리즈의 게시물을 찾을 수 없습니다.');
    }

    // 2. 관계 제거
    await this.seriesService.removeRelation(hasRelation);
  }
}
