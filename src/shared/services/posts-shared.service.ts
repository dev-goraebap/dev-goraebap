import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsSharedService {
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

  async updateViewCount(slug: string) {
    const result = await this.postRepository.increment({ slug }, 'viewCount', 1);
    if (result.affected === 0) {
      throw new BadRequestException('조회수 업데이트에 실패하였습니다.');
    }
  }

  async getPublishedPosts(): Promise<PostEntity[]> {
    return this.postRepository.find({
      where: { isPublished: true },
      select: ['slug', 'updatedAt', 'publishedAt'],
      order: { publishedAt: 'DESC' },
    });
  }
}
