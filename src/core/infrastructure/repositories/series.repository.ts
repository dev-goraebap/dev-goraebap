import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { AttachmentQueryHelper } from "src/shared";
import { SeriesEntity } from "../entities";

@Injectable()
export class SeriesRepository {

  constructor(
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>
  ) { }

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