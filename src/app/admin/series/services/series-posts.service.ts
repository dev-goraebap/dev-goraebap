import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { PostEntity, SeriesEntity, SeriesPostEntity } from 'src/shared';

@Injectable()
export class SeriesPostsService {
  constructor(
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
    @InjectRepository(SeriesPostEntity)
    private readonly seriesPostRepository: Repository<SeriesPostEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async getPostsExcludeBy(seriesId: number, postTitle: string = '') {
    console.log(postTitle);
    // 특정 시리즈에 속하지 않은 모든 포스트(다른 시리즈에 속한 포스트 + 어떤 시리즈에도 속하지 않은 포스트)를 반환
    const qb = this.postRepository.createQueryBuilder('post');
    qb.where(
      `NOT EXISTS (
      SELECT 1 FROM series_posts sp 
      WHERE sp.post_id = post.id 
      AND sp.series_id = :seriesId
    )`,
      { seriesId },
    );

    if (postTitle) {
      qb.andWhere('post.title LIKE :postTitle', {
        postTitle: `%${postTitle}%`,
      });
    }

    qb.orderBy('post.createdAt', 'DESC');
    qb.take(5);

    return await qb.getMany();
  }

  async create(seriesId: number, postId: number) {
    const series = await this.seriesRepository.findOne({
      where: {
        id: seriesId,
      },
    });
    if (!series) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }

    const newSeriesPost = this.seriesPostRepository.create({
      series,
      post,
    });
    await this.seriesPostRepository.save(newSeriesPost);
  }

  async updateOrders(idAndOrders: { id: number; order: number }[]) {
    const idAndOrderMap = new Map(idAndOrders.map(({ id, order }) => [id, order]));
    const ids = Array.from(idAndOrderMap.keys());

    console.log(ids);

    const seriesPosts = await this.seriesPostRepository.find({
      where: { id: In(ids) },
    });

    const updated = seriesPosts.map((seriesPost) =>
      this.seriesPostRepository.create({
        ...seriesPost,
        order: idAndOrderMap.get(seriesPost.id) ?? 0,
      }),
    );

    await this.seriesPostRepository.save(updated);
  }

  async destroy(seriesId: number, postId: number) {
    const seriesPost = await this.seriesPostRepository.findOne({
      where: {
        series: {
          id: seriesId,
        },
        post: {
          id: postId,
        },
      },
    });
    if (!seriesPost) {
      throw new BadRequestException('시리즈의 게시물을 찾을 수 없습니다.');
    }
    await this.seriesPostRepository.remove(seriesPost);
  }
}
