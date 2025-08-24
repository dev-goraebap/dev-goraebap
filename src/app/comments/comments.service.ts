import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CommentEntity, PostEntity } from 'src/shared';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async getComments(postId: number) {
    return await this.commentRepository.find({
      where: {
        post: {
          id: postId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async create(requestId: string, postId: number, dto: CreateCommentDto) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }
    const newComment = this.commentRepository.create({
      requestId,
      post,
      ...dto,
    });
    await this.commentRepository.save(newComment);
  }
}
