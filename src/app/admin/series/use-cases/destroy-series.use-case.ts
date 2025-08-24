import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { AttachmentEntity, SeriesEntity } from 'src/shared';

@Injectable()
export class DestroySeriesUseCase {
  constructor(
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepository: Repository<AttachmentEntity>,
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async execute(id: number) {
    await this.entityManager.transaction(async () => {
      const series = await this.seriesRepository.findOne({
        where: { id },
      });
      if (!series) {
        throw new BadRequestException('시리즈를 찾을 수 없습니다.');
      }

      // 기존의 연결된 첨부이미지들 제거
      const seriesAttachments = await this.attachmentRepository.find({
        where: {
          name: 'thumbnail',
          recordType: 'series',
          recordId: series.id.toString(),
        },
      });
      if (seriesAttachments.length !== 0) {
        await this.entityManager.remove(seriesAttachments);
      }

      await this.entityManager.remove(series);
    });
  }
}
