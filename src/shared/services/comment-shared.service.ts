import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CommentEntity } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentsSharedService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async getComments(postSlug: string) {
    return await this.commentRepository.find({
      where: {
        post: {
          slug: postSlug,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
