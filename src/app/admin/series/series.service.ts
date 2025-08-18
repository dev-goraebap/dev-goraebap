import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AttachmentQueryHelper, SeriesEntity } from 'src/shared';
import { GetSeriesDto } from './dto/get-series.dto';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
  ) {}

  async getSeriesList(dto: GetSeriesDto) {
    const qb = this.seriesRepository.createQueryBuilder('series');
    qb.leftJoinAndSelect('series.posts', 'post');
    AttachmentQueryHelper.withAttachments(qb, 'series');

    if (dto.search) {
      qb.where('series.name LIKE :searchName', {
        searchName: `%${dto.search}%`,
      });
    }

    qb.orderBy(`series.${dto.orderKey}`, dto.orderBy);

    return await qb.getMany();
  }

  async getSeriesItem(id: number) {
    const qb = this.seriesRepository.createQueryBuilder('series');
    AttachmentQueryHelper.withAttachments(qb, 'series');

    qb.where('series.id = :id', { id });
    const series = await qb.getOne();

    if (!series) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }
    return series;
  }
}
