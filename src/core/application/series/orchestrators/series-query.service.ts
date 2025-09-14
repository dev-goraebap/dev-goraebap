import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';

import { GetAdminSeriesDto } from 'src/core/infrastructure/dto';
import { PostEntity, SeriesEntity, SeriesPostEntity } from 'src/core/infrastructure/entities';
import { SeriesRepository } from 'src/core/infrastructure/repositories';
import { AttachmentQueryHelper } from 'src/shared';

@Injectable()
export class SeriesQueryService {
  constructor(
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(SeriesPostEntity)
    private readonly seriesPostRepository: Repository<SeriesPostEntity>,
    private readonly customSeriesRepository: SeriesRepository
  ) { }

  async getAdminSeriesList(dto: GetAdminSeriesDto) {
    return this.customSeriesRepository.findAdminSeriesList(dto);
  }

  async getAdminSeriesWithPosts(id: number): Promise<SeriesEntity> {
    const series = await this.customSeriesRepository.findSeriesWithPosts(id);
    if (!series) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }
    return series;
  }

  async getSeriesList(): Promise<SeriesEntity[]> {
    const qb = this.seriesRepository.createQueryBuilder('series');
    qb.leftJoinAndSelect('series.seriesPosts', 'post');
    AttachmentQueryHelper.withAttachments(qb, 'series');

    qb.where("series.isPublishedYn = 'Y'");
    qb.orderBy('series.createdAt', 'DESC');

    return await qb.getMany();
  }

  async getSeries(slug: string): Promise<SeriesEntity | null> {
    const qb = this.seriesRepository.createQueryBuilder('series');
    AttachmentQueryHelper.withAttachments(qb, 'series');

    qb.where("series.isPublishedYn = 'Y'");
    qb.andWhere('series.slug = :slug', { slug });
    return await qb.getOne();
  }

  async getSeriesPosts(seriesSlug: string): Promise<PostEntity[]> {
    const qb = this.postRepository.createQueryBuilder('post');
    qb.leftJoinAndSelect('post.comments', 'comment');
    qb.leftJoinAndSelect('post.seriesPosts', 'seriesPost');
    qb.leftJoinAndSelect('seriesPost.series', 'series');
    AttachmentQueryHelper.withAttachments(qb, 'post');

    qb.where("post.isPublishedYn = 'Y'");
    qb.andWhere('series.slug = :seriesSlug', { seriesSlug });

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

    qb.where("post.isPublishedYn = 'Y'");
    qb.andWhere('post.slug = :postSlug', { postSlug });
    qb.andWhere('series.slug = :seriesSlug', { seriesSlug });

    const result = await qb.getOne();
    if (!result) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    const currentSeriesPost = seriesSlug
      ? result.seriesPosts.find((sp) => sp.series.slug === seriesSlug)
      : result.seriesPosts[0];

    if (!currentSeriesPost) {
      throw new NotFoundException('시리즈 포스트를 찾을 수 없습니다.');
    }

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

  async updatePostOrders(items: { id: number; order: number }[]): Promise<void> {
    const ids = items.map((item) => item.id);

    const relations = await this.seriesPostRepository.find({
      where: { id: In(ids) },
    });

    const updated = relations.map((relation) => {
      const newOrder = items.find((item) => item.id === relation.id)?.order ?? 999;
      return this.seriesPostRepository.create({ ...relation, order: newOrder });
    });

    await this.seriesPostRepository.save(updated);
  }

  private async getPrevPost(currentOrder: number, currentCreatedAt: Date, seriesId: number, currentPostId: number) {
    const result = await this.seriesPostRepository
      .createQueryBuilder('seriesPost')
      .leftJoinAndSelect('seriesPost.post', 'post')
      .leftJoinAndSelect('seriesPost.series', 'series')
      .where("post.isPublishedYn = 'Y'")
      .andWhere('seriesPost.series.id = :seriesId', { seriesId })
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
      .where("post.isPublishedYn = 'Y'")
      .andWhere('seriesPost.series.id = :seriesId', { seriesId })
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