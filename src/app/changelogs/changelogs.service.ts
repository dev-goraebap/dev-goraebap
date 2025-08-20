import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentQueryHelper, PostEntity } from 'src/shared';
import { Repository } from 'typeorm';

@Injectable()
export class ChangelogsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async getChangelogsExcludeBy(slug: string) {
    const qb = this.postRepository.createQueryBuilder('post');
    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.where('post.postType = :postType', { postType: 'changelog' }).andWhere('post.slug != :slug', { slug: slug });
    qb.orderBy('post.createdAt', 'DESC');
    return await qb.getMany();
  }

  async getChangelog(slug: string) {
    const qb = this.postRepository.createQueryBuilder('post').where('post.slug = :slug', { slug: slug });
    AttachmentQueryHelper.withAttachments(qb, 'post');
    const result = await qb.getOne();
    if (!result) {
      throw new NotFoundException('체인지로그를 찾을 수 없습니다.');
    }
    return result;
  }
}
