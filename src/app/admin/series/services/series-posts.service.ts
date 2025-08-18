import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostEntity, SeriesEntity } from 'src/shared';

@Injectable()
export class SeriesPostsService {
  constructor(
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
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
}
