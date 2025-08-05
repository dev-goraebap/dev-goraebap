import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { AttachmentEntity, SeriesEntity } from 'src/shared';

@Injectable()
export class DestroySeriesUseCase {
  constructor(private readonly entityManager: EntityManager) {}

  async execute(id: number) {
    await this.entityManager.transaction(async () => {
      const series = await SeriesEntity.findOne({
        where: { id },
      });
      if (!series) {
        throw new BadRequestException('시리즈를 찾을 수 없습니다.');
      }

      // 기존의 연결된 첨부이미지들 제거
      const seriesAttachments = await AttachmentEntity.find({
        where: {
          name: 'thumbnail',
          recordType: 'series',
          recordId: series.id.toString(),
        },
      });
      if (seriesAttachments.length !== 0) {
        console.log(`${seriesAttachments.length}개의 첨부 이미지 제거`);
        await AttachmentEntity.remove(seriesAttachments);
      }

      await series.remove();
    });
  }
}
