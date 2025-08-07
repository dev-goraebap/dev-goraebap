import { BadRequestException, Injectable } from '@nestjs/common';
import { SeriesEntity } from 'src/shared';
import { Like, Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { GetSeriesDto } from './dto/get-series.dto';

@Injectable()
export class SeriesService {

  constructor(
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>
  ) {}

  async getSeriesList(dto: GetSeriesDto) {
    const where: any = {};
    if (dto.search) {
      where.name = Like(`%${dto.search}%`);
    }

    const queryBuilder = this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.posts', 'posts')
      .leftJoinAndMapMany('series.attachments', 'attachments', 'attachment', 
        'attachment.recordType = :recordType AND attachment.recordId = CAST(series.id AS VARCHAR) AND attachment.name = :attachmentName',
        { recordType: 'series', attachmentName: 'thumbnail' }
      )
      .leftJoinAndSelect('attachment.blob', 'blob')
      .orderBy(`series.${dto.orderKey}`, dto.orderBy);

    if (where.name) {
      queryBuilder.where('series.name LIKE :searchName', { searchName: where.name });
    }

    return await queryBuilder.getMany();
  }

  async getSeriesItem(id: number) {
    const series = await this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.posts', 'posts')
      .leftJoinAndMapMany('series.attachments', 'attachments', 'attachment', 
        'attachment.recordType = :recordType AND attachment.recordId = CAST(series.id AS VARCHAR) AND attachment.name = :attachmentName',
        { recordType: 'series', attachmentName: 'thumbnail' }
      )
      .leftJoinAndSelect('attachment.blob', 'blob')
      .where('series.id = :id', { id })
      .getOne();
      
    if (!series) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }
    return series;
  }
}
