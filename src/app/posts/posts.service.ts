import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentQueryHelper, PostEntity } from 'src/shared';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>
  ) {}

  async getPostsExcludeBy(slug: string) {
    const qb = this.postRepository.createQueryBuilder('post').leftJoinAndSelect('post.tags', 'tag');

    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.where('post.isPublished = :isPublished', { isPublished: true })
      .andWhere('post.slug != :slug', {
        slug,
      })
      .andWhere('post.postType = :postType', { postType: 'post' });
    qb.orderBy('post.createdAt', 'DESC');
    qb.take(10);

    return await qb.getMany();
  }

  async getPost(slug: string) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .where('post.slug = :slug', { slug });
    AttachmentQueryHelper.withAttachments(qb, 'post');
    const result = await qb.getOne();
    if (!result) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return result;
  }
}
