import { BadRequestException, Injectable } from '@nestjs/common';

import { CommentService } from '../services/comment.service';

@Injectable()
export class CommentModerationService {
  constructor(
    private readonly commentService: CommentService,
  ) {}

  async banComment(id: number) {
    // 1. 댓글 조회 및 검증
    const comment = await this.commentService.findById(id);
    if (!comment) {
      throw new BadRequestException('댓글을 찾을 수 없습니다.');
    }

    // 2. 댓글 차단 (소프트 삭제)
    await this.commentService.banComment(comment);
  }
}