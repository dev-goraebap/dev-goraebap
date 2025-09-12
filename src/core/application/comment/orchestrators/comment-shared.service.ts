import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommentEntity } from 'src/core/infrastructure/entities';

@Injectable()
export class CommentSharedService {
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
        createdAt: 'ASC',
      },
    });
  }
}
