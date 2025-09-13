import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GetAdminCommentsDto } from 'src/core/infrastructure/dto';
import { CommentEntity } from 'src/core/infrastructure/entities';
import { CommentRepository } from 'src/core/infrastructure/repositories';

@Injectable()
export class CommentQueryService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly customCommentRepository: CommentRepository
  ) { }

  // ---------------------------------------------------------------------------
  // 일반 조회
  // ---------------------------------------------------------------------------

  async getPostComments(postSlug: string) {
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

  // ---------------------------------------------------------------------------
  // 관리자 조회
  // ---------------------------------------------------------------------------

  async getAdminComments(dto: GetAdminCommentsDto) {
    return this.customCommentRepository.findAdminComments(dto);
  }
}