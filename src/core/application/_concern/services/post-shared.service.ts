import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostEntity } from 'src/core/infrastructure/entities';

@Injectable()
export class PostSharedService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async findById(id: number) {
    return this.postRepository.findOne({ where: { id } });
  }

  async getPostsExcludeBy(seriesId: number, postTitle: string = '') {
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

  async getPublishedPosts(): Promise<PostEntity[]> {
    return this.postRepository.find({
      where: { isPublishedYn: 'Y' },
      select: ['slug', 'updatedAt', 'publishedAt'],
      order: { publishedAt: 'DESC' },
    });
  }
}
