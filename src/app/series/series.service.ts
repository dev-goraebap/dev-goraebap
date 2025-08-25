import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentQueryHelper, PostEntity, SeriesEntity, SeriesPostEntity } from 'src/shared';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(SeriesPostEntity)
    private readonly seriesPostRepository: Repository<SeriesPostEntity>,
  ) {}

  async getSeriesList() {
    const qb = this.seriesRepository.createQueryBuilder('series');
    qb.leftJoinAndSelect('series.seriesPosts', 'post');

    AttachmentQueryHelper.withAttachments(qb, 'series');
    qb.orderBy('series.createdAt', 'DESC');

    return await qb.getMany();
  }

  async getSeries(slug: string) {
    const qb = this.seriesRepository.createQueryBuilder('series');
    AttachmentQueryHelper.withAttachments(qb, 'series');

    qb.where('series.slug = :slug', { slug });
    return await qb.getOne();
  }

  async getSeriesPosts(seriesSlug: string) {
    const qb = this.postRepository.createQueryBuilder('post');
    qb.leftJoinAndSelect('post.comments', 'comment');
    qb.leftJoinAndSelect('post.seriesPosts', 'seriesPost');
    qb.leftJoinAndSelect('seriesPost.series', 'series');
    AttachmentQueryHelper.withAttachments(qb, 'post');

    qb.where('series.slug = :seriesSlug', { seriesSlug });

    qb.orderBy('seriesPost.order', 'ASC');
    qb.addOrderBy('seriesPost.createdAt', 'DESC');

    return await qb.getMany();
  }

  async getSeriesPost(postSlug: string, seriesSlug: string) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.seriesPosts', 'seriesPost')
      .leftJoinAndSelect('seriesPost.series', 'series');

    AttachmentQueryHelper.withAttachments(qb, 'post');

    qb.where('post.slug = :postSlug', { postSlug }).andWhere('series.slug = :seriesSlug', { seriesSlug });

    const result = await qb.getOne();
    if (!result) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    // 해당 시리즈의 SeriesPost 찾기
    const currentSeriesPost = seriesSlug
      ? result.seriesPosts.find((sp) => sp.series.slug === seriesSlug)
      : result.seriesPosts[0]; // seriesSlug가 없으면 첫 번째

    if (!currentSeriesPost) {
      throw new NotFoundException('시리즈 포스트를 찾을 수 없습니다.');
    }

    // 이전/다음 포스트 가져오기
    const [prevPost, nextPost] = await Promise.all([
      this.getPrevPost(currentSeriesPost.order, currentSeriesPost.createdAt, currentSeriesPost.series.id, result.id),
      this.getNextPost(currentSeriesPost.order, currentSeriesPost.createdAt, currentSeriesPost.series.id, result.id),
    ]);

    return {
      post: result,
      prevPost,
      nextPost,
    };
  }

  private async getPrevPost(currentOrder: number, currentCreatedAt: Date, seriesId: number, currentPostId: number) {
    const result = await this.seriesPostRepository
      .createQueryBuilder('seriesPost')
      .leftJoinAndSelect('seriesPost.post', 'post')
      .leftJoinAndSelect('seriesPost.series', 'series')
      .where('seriesPost.series.id = :seriesId', { seriesId })
      .andWhere('post.id != :currentPostId', { currentPostId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('seriesPost.order < :currentOrder', { currentOrder }).orWhere(
            'seriesPost.order = :currentOrder AND seriesPost.createdAt < :currentCreatedAt',
            {
              currentOrder,
              currentCreatedAt,
            },
          );
        }),
      )
      .orderBy('seriesPost.order', 'DESC')
      .addOrderBy('seriesPost.createdAt', 'DESC')
      .getOne();

    return result?.post;
  }

  private async getNextPost(currentOrder: number, currentCreatedAt: Date, seriesId: number, currentPostId: number) {
    const result = await this.seriesPostRepository
      .createQueryBuilder('seriesPost')
      .leftJoinAndSelect('seriesPost.post', 'post')
      .leftJoinAndSelect('seriesPost.series', 'series')
      .where('seriesPost.series.id = :seriesId', { seriesId })
      .andWhere('post.id != :currentPostId', { currentPostId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('seriesPost.order > :currentOrder', { currentOrder }).orWhere(
            'seriesPost.order = :currentOrder AND seriesPost.createdAt > :currentCreatedAt',
            {
              currentOrder,
              currentCreatedAt,
            },
          );
        }),
      )
      .orderBy('seriesPost.order', 'ASC')
      .addOrderBy('seriesPost.createdAt', 'ASC')
      .getOne();

    return result?.post;
  }
}
