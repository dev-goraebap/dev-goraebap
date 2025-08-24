import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentQueryHelper, PostEntity } from 'src/shared';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async getRandomSuggestedPosts(excludeSlug: string) {
    const posts = await this.postRepository
      .createQueryBuilder('post')
      .where('post.isPublished = :isPublished', { isPublished: true })
      .andWhere('post.slug != :slug', { slug: excludeSlug })
      .andWhere('post.postType = :postType', { postType: 'post' })
      .getMany();

    const shuffled = posts.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    const qb = this.postRepository.createQueryBuilder('post');
    qb.leftJoinAndSelect('post.tags', 'tag');
    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.whereInIds(selected.map((p) => p.id));

    return await qb.getMany();
  }

  async getPost(slug: string) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.comments', 'comment')
      .where('post.slug = :slug', { slug })
      .orderBy('comment.createdAt', 'DESC');
    AttachmentQueryHelper.withAttachments(qb, 'post');
    const result = await qb.getOne();
    if (!result) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return result;
  }
}
