import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AttachmentQueryHelper, PostEntity } from 'src/shared';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async getPosts() {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .where('post.isPublished = :isPublished', { isPublished: true })
      .andWhere('post.postType = :postType', { postType: 'post' });

    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.orderBy('post.createdAt', 'DESC');
    qb.take(10);

    return await qb.getMany();
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

  async getNewsPosts() {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .where('post.isPublished = :isPublished', { isPublished: true })
      .andWhere('post.postType = :postType', { postType: 'news' });

    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.orderBy('post.createdAt', 'DESC');
    qb.take(3);

    return await qb.getMany();
  }
}
