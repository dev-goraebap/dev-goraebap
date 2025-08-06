import { BadRequestException, Injectable } from '@nestjs/common';
import { Like } from 'typeorm';

import { PostEntity } from 'src/shared';
import { GetPostsDTO } from './dto/get-posts.dto';

@Injectable()
export class PostsService {
  async getPosts(dto: GetPostsDTO) {
    const where: any = {};
    if (dto.search) {
      where.name = Like(`%${dto.search}%`);
    }

    const queryBuilder = PostEntity.createQueryBuilder('post')
      .leftJoinAndMapMany(
        'post.attachments',
        'attachments',
        'attachment',
        'attachment.recordType = :recordType AND attachment.recordId = CAST(post.id AS VARCHAR) AND attachment.name = :attachmentName',
        { recordType: 'post', attachmentName: 'thumbnail' },
      )
      .leftJoinAndSelect('attachment.blob', 'blob')
      .orderBy(`post.${dto.orderKey}`, dto.orderBy);

    if (where.name) {
      queryBuilder.where('post.name LIKE :searchName', {
        searchName: where.name,
      });
    }

    return await queryBuilder.getMany();
  }

  async getPost(id: number) {
    const post = await PostEntity.createQueryBuilder('post')
      .leftJoinAndMapMany(
        'post.attachments',
        'attachments',
        'attachment',
        'attachment.recordType = :recordType AND attachment.recordId = CAST(post.id AS VARCHAR) AND attachment.name = :attachmentName',
        { recordType: 'post', attachmentName: 'thumbnail' },
      )
      .leftJoinAndSelect('attachment.blob', 'blob')
      .where('post.id = :id', { id })
      .getOne();

    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }

    return post;
  }
}
