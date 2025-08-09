import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentQueryHelper, PostEntity } from 'src/shared';
import { GetPostsDTO } from './dto/get-posts.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async getPosts(dto: GetPostsDTO) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag');
    AttachmentQueryHelper.withAttachments(qb, 'post');

    // 검색 조건 추가
    if (dto.search) {
      qb.where('post.title LIKE :title', {
        title: `%${dto.search}%`,
      });
    }

    // 정렬 추가
    qb.orderBy(`post.${dto.orderKey}`, dto.orderBy);

    return await qb.getMany();
  }

  async getPost(id: number) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag');
    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.where('post.id = :id', { id });
    const post = await qb.getOne();

    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }
    return post;
  }
}
