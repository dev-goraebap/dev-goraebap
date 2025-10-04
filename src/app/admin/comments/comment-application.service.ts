import { BadRequestException, Injectable } from '@nestjs/common';

import { CommentEntity } from 'src/domain/comment';
import { LoggerService } from 'src/shared/logger';

@Injectable()
export class CommentApplicationService {

  constructor(
    private readonly logger: LoggerService
  ) { }

  async banComment(id: number) {
    // 1. 댓글 조회 및 검증
    const comment = await CommentEntity.findById(id);
    if (!comment) {
      throw new BadRequestException('댓글을 찾을 수 없습니다.');
    }

    // 2. 댓글 차단
    try {
      const bannedComment = comment.ban();
      return await bannedComment.save();
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }
}