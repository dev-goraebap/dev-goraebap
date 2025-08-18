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
      .leftJoinAndSelect('series.posts', 'post', 'post.isPublished = :isPublished', { isPublished: true })
      .leftJoinAndSelect('post.tags', 'tag')
      .where('series.id = :id', { id })
      .getOne();

    if (!series) {
      return null;
    }

    // // posts에 대한 attachment 정보도 가져오기
    // if (series.posts && series.posts.length > 0) {
    //   const postsWithAttachments = await this.postRepository
    //     .createQueryBuilder('post')
    //     .leftJoinAndSelect('post.tags', 'tag')
    //     .whereInIds(series.posts.map(p => p.id))
    //     .orderBy('post.publishedAt', 'DESC')
    //     .getMany();

    //   // AttachmentQueryHelper로 각 포스트의 attachment 가져오기
    //   for (const post of postsWithAttachments) {
    //     const qb = this.postRepository
    //       .createQueryBuilder('post')
    //       .where('post.id = :id', { id: post.id });
    //     AttachmentQueryHelper.withAttachments(qb, 'post');
    //     const postWithAttachment = await qb.getOne();
    //     if (postWithAttachment) {
    //       Object.assign(post, postWithAttachment);
    //     }
    //   }

    //   series.posts = postsWithAttachments;
    // }

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
