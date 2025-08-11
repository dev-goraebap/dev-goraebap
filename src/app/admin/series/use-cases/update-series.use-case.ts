import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';

import { AttachmentEntity, BlobEntity, SeriesEntity } from 'src/shared';
import { UpdateSeriesDto } from '../dto/create-or-update-series.dto';

@Injectable()
export class UpdateSeriesUseCase {
  constructor(
    @InjectRepository(BlobEntity)
    private readonly blobRepository: Repository<BlobEntity>,
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepository: Repository<AttachmentEntity>,
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async execute(id: number, dto: UpdateSeriesDto) {
    await this.entityManager.transaction(async () => {
      const series = await this.seriesRepository.findOne({
        where: { id },
      });
      if (!series) {
        throw new BadRequestException('시리즈를 찾을 수 없습니다.');
      }

      // 시리즈 이름 중복 채크
      const hasDuplicateSeries = await this.seriesRepository.exists({
        where: {
          name: dto.name,
          id: Not(series.id),
        },
      });
      if (hasDuplicateSeries) {
        throw new BadRequestException('이미 사용중인 시리즈 이름입니다.');
      }

      // 시리즈 수정
      let updatedSeriesEntity = this.seriesRepository.create({ ...series, ...dto });
      updatedSeriesEntity = await this.entityManager.save(updatedSeriesEntity);

      if (!dto.thumbnailBlobId) {
        return;
      }

      // 새로운 썸네일 이미지가 들어온경우
      // 썸네일 파일 존재 확인
      const blobEntity = await this.blobRepository.findOne({
        where: { id: dto.thumbnailBlobId },
      });
      if (!blobEntity) {
        throw new BadRequestException(
          '시리즈 썸네일 이미지 파일을 찾을 수 없습니다.',
        );
      }

      // 기존의 연결된 첨부이미지들 제거
      const seriesAttachments = await this.attachmentRepository.find({
        where: {
          name: 'thumbnail',
          recordType: 'series',
          recordId: updatedSeriesEntity.id.toString(),
        },
      });
      if (seriesAttachments.length !== 0) {
        console.debug(`${seriesAttachments.length}개의 첨부 이미지 제거`);
        await this.entityManager.remove(seriesAttachments);
      }

      // 시리즈와 파일의 첨부 관계 생성
      const newAttachmentEntity = this.attachmentRepository.create({
        blob: blobEntity,
        name: 'thumbnail',
        recordType: 'series',
        recordId: updatedSeriesEntity.id.toString(),
      });
      await this.entityManager.save(newAttachmentEntity);
    });
  }
}
