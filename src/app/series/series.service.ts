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

  async getSeries() {
    const qb = this.seriesRepository.createQueryBuilder('series');
    qb.leftJoinAndSelect('series.seriesPosts', 'post');

    AttachmentQueryHelper.withAttachments(qb, 'series');
    qb.orderBy('series.createdAt', 'DESC');

    return await qb.getMany();
  }

  async getSeriesWithPosts(id: string) {
    const series = await this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.seriesPosts', 'seriesPost')
      .leftJoinAndSelect('seriesPost.post', 'post', 'post.isPublished = :isPublished', { isPublished: true })
      .leftJoinAndSelect('post.tags', 'tag')
      .where('series.id = :id', { id })
      .orderBy('seriesPost.order', 'ASC')
      .getOne();

    if (!series) {
      return null;
    }

    // 포스트에 대한 attachment 정보 가져오기
    if (series.seriesPosts && series.seriesPosts.length > 0) {
      for (const seriesPost of series.seriesPosts) {
        if (seriesPost.post) {
          const qb = this.postRepository
            .createQueryBuilder('post')
            .where('post.id = :id', { id: seriesPost.post.id });
          AttachmentQueryHelper.withAttachments(qb, 'post');
          const postWithAttachment = await qb.getOne();
          if (postWithAttachment) {
            Object.assign(seriesPost.post, postWithAttachment);
          }
        }
      }
    }

    // series의 attachment 정보 가져오기
    const qb = this.seriesRepository.createQueryBuilder('series').where('series.id = :id', { id });
    AttachmentQueryHelper.withAttachments(qb, 'series');
    const seriesWithAttachment = await qb.getOne();

    if (seriesWithAttachment) {
      Object.assign(series, seriesWithAttachment);
    }

    return series;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PLAN':
        return '준비중';
      case 'PROGRESS':
        return '연재중';
      case 'COMPLETE':
        return '완료';
      default:
        return '준비중';
    }
  }
}
