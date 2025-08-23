import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import {
  AttachmentEntity,
  BlobEntity,
  SeriesEntity,
  UserEntity,
} from 'src/shared';
import { CreateSeriesDto } from '../dto/create-or-update-series.dto';

@Injectable()
export class CreateSeriesUseCase {
  constructor(
    @InjectRepository(BlobEntity)
    private readonly blobRepository: Repository<BlobEntity>,
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepository: Repository<AttachmentEntity>,
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async execute(user: UserEntity, dto: CreateSeriesDto) {
    await this.entityManager.transaction(async () => {
      // 썸네일 파일 존재 확인
      const blobEntity = await this.blobRepository.findOne({
        where: { id: dto.thumbnailBlobId },
      });
      if (!blobEntity) {
        throw new BadRequestException(
          '시리즈 썸네일 이미지 파일을 찾을 수 없습니다.',
        );
      }

      // 시리즈 이름 중복 채크
      const hasDuplicateSeries = await this.seriesRepository.exists({
        where: {
          name: dto.name,
        },
      });
      if (hasDuplicateSeries) {
        throw new BadRequestException('이미 사용중인 시리즈 이름입니다.');
      }

      // 시리즈 생성
      let newSeriesEntity = this.seriesRepository.create({ user, ...dto });
      newSeriesEntity = await this.entityManager.save(newSeriesEntity);

      // 시리즈와 파일의 첨부 관계 생성
      const newAttachmentEntity = this.attachmentRepository.create({
        blob: blobEntity,
        name: 'thumbnail',
        recordType: 'series',
        recordId: newSeriesEntity.id.toString()
      });
      await this.entityManager.save(newAttachmentEntity);
    });
  }
}
