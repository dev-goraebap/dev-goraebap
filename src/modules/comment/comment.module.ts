import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentEntity, PostEntity } from 'src/shared';
import { CommentService } from './application/services/comment.service';
import { CommentQueryService } from './application/services/comment-query.service';
import { CommentCreationService } from './application/orchestrators/comment-creation.service';
import { CommentModerationService } from './application/orchestrators/comment-moderation.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity, PostEntity])],
  providers: [
    // Level 1: 순수 도메인 서비스
    CommentService,
    CommentQueryService,
    
    // Level 2: 오케스트레이션 서비스
    CommentCreationService,
    CommentModerationService,
  ],
  exports: [
    CommentService,
    CommentQueryService,
    CommentCreationService,
    CommentModerationService,
  ],
})
export class CommentModule {}