import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { AttachmentQueryHelper } from "src/shared";
import { GetAdminSeriesDto } from "../dto";
import { SeriesEntity } from "../entities";

@Injectable()
export class SeriesRepository {

  constructor(
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>
  ) { }


  async findAdminSeriesList(dto: GetAdminSeriesDto) {
    const qb = this.seriesRepository.createQueryBuilder('series');
    qb.leftJoinAndSelect('series.seriesPosts', 'post');
    AttachmentQueryHelper.withAttachments(qb, 'series');

    if (dto.search) {
      qb.where('series.name LIKE :searchName', {
        searchName: `%${dto.search}%`,
      });
    }

    if (dto.status) {
      qb.andWhere('series.status = :status', { status: dto.status });
    }

    if (dto.isPublishedYn) {
      qb.andWhere('series.isPublishedYn = :isPublishedYn', {
        isPublishedYn: dto.isPublishedYn,
      });
    }

    qb.orderBy(`series.${dto.orderKey}`, dto.orderBy);

    const offset = (dto.page - 1) * dto.perPage;
    qb.skip(offset).take(dto.perPage);

    const [seriesList, total] = await qb.getManyAndCount();

    return {
      seriesList,
      pagination: {
        page: dto.page,
        perPage: dto.perPage,
        total,
        totalPages: Math.ceil(total / dto.perPage),
      },
    };
  }

  // 리팩토링 필요.
  async findSeriesWithPosts(id: number) {
    const qb = this.seriesRepository.createQueryBuilder('series');
    qb.leftJoinAndSelect('series.seriesPosts', 'seriesPost');
    qb.leftJoinAndSelect('seriesPost.post', 'post');
    AttachmentQueryHelper.withAttachments(qb, 'series');

    qb.where('series.id = :id', { id });
    qb.orderBy('seriesPost.order', 'ASC');
    qb.addOrderBy('seriesPost.createdAt', 'DESC');
    return await qb.getOne();
  }
}