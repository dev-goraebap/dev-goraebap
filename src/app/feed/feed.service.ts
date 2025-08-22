import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AttachmentQueryHelper, PostEntity, TagEntity } from 'src/shared';
import { GetPostsDto } from './dto/get-posts.dto';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async getPosts(dto: GetPostsDto) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .where('post.isPublished = :isPublished', { isPublished: true })
      .andWhere('post.postType = :postType', { postType: 'post' });

    AttachmentQueryHelper.withAttachments(qb, 'post');

    if (dto.cursor) {
      const [publishedAt, viewCount] = dto.cursor.split('_');

      if (dto.orderType === 'traffic') {
        qb.andWhere(
          '(post.viewCount < :viewCount OR (post.viewCount = :viewCount AND post.publishedAt < :publishedAt))',
          { viewCount: parseInt(viewCount), publishedAt },
        );
      } else {
        qb.andWhere('post.publishedAt < :publishedAt', { publishedAt });
      }
    }

    if (dto.tag) {
      qb.andWhere('tag.name = :tag', { tag: dto.tag });
    }

    if (dto.orderType === 'traffic') {
      qb.orderBy('post.viewCount', 'DESC').addOrderBy('post.publishedAt', 'DESC');
    } else {
      qb.orderBy('post.publishedAt', 'DESC');
    }

    qb.take(dto.perPage + 1);

    const posts = await qb.getMany();
    const hasMore = posts.length > dto.perPage;
    const items = hasMore ? posts.slice(0, dto.perPage) : posts;

    let nextCursor: string | null = null;
    if (hasMore) {
      const lastItem = items[items.length - 1];
      if (dto.orderType === 'traffic') {
        nextCursor = `${lastItem.publishedAt.toISOString()}_${lastItem.viewCount}`;
      } else {
        nextCursor = lastItem.publishedAt.toISOString();
      }
    }

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  async getLatestPatchNote() {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .where('post.isPublished = :isPublished', { isPublished: true })
      .andWhere('post.postType = :postType', { postType: 'patch-note' });

    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.orderBy('post.createdAt', 'DESC');
    qb.take(1);

    return await qb.getOne();
  }

  async getTags() {
    return await this.tagRepository.find({
      relations: {
        posts: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
