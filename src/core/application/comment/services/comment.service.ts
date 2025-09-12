import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommentEntity, PostEntity } from 'src/core/infrastructure/entities';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async findPostBySlug(slug: string): Promise<PostEntity> {
    const post = await this.postRepository.findOne({
      where: { slug },
    });
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }
    return post;
  }

  async createComment(requestId: string, post: PostEntity, dto: CreateCommentDto): Promise<CommentEntity> {
    const newComment = this.commentRepository.create({
      requestId,
      post,
      ...dto,
    });
    return await this.commentRepository.save(newComment);
  }

  async findById(id: number): Promise<CommentEntity | null> {
    return this.commentRepository.findOne({ where: { id } });
  }

  async banComment(comment: CommentEntity): Promise<void> {
    await this.commentRepository.softRemove(comment);
  }
}