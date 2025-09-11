import { Module } from '@nestjs/common';

import { CommentCommandService } from './application/orchestrators/comment-command.service';
import { CommentQueryService } from './application/orchestrators/comment-query.service';
import { CommentService } from './application/services/comment.service';

@Module({
  providers: [
    // Level 1: 순수 도메인 서비스
    CommentService,
    
    // Level 2: 오케스트레이션 서비스
    CommentQueryService,
    CommentCommandService,
  ],
  exports: [
    CommentService,
    CommentQueryService,
    CommentCommandService,
  ],
})
export class CommentModule {}