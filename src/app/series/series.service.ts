import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentQueryHelper, PostEntity, SeriesEntity } from 'src/shared';
import { Repository } from 'typeorm';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async getSeriesList() {
    const qb = this.seriesRepository.createQueryBuilder('series');
    qb.leftJoinAndSelect('series.seriesPosts', 'post');

    AttachmentQueryHelper.withAttachments(qb, 'series');
    qb.orderBy('series.createdAt', 'DESC');

    return await qb.getMany();
  }

  async getSeries(id: number) {
    const qb = this.seriesRepository.createQueryBuilder('series');
    AttachmentQueryHelper.withAttachments(qb, 'series');

    qb.where('series.id = :id', { id });
    return await qb.getOne();
  }

  async getSeriesPosts(seriesId: number) {
    const qb = this.postRepository.createQueryBuilder('post');
    qb.leftJoinAndSelect('post.seriesPosts', 'seriesPost');
    qb.leftJoinAndSelect('seriesPost.series', 'series');
    AttachmentQueryHelper.withAttachments(qb, 'post');

    qb.where('series.id = :seriesId', { seriesId });

    qb.orderBy('seriesPost.order', 'ASC');
    qb.addOrderBy('seriesPost.createdAt', 'DESC');

    return await qb.getMany();
  }
}
