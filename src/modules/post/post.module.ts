import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostEntity } from 'src/shared';
import { PostService } from './application/services/post.service';
import { PostQueryService } from './application/services/post-query.service';
import { PostCreationService } from './application/orchestrators/post-creation.service';
import { PostUpdateService } from './application/orchestrators/post-update.service';
import { PostDeletionService } from './application/orchestrators/post-deletion.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity])],
  providers: [
    // Level 1: 순수 도메인 서비스
    PostService,
    PostQueryService,
    
    // Level 2: 오케스트레이션 서비스
    PostCreationService,
    PostUpdateService,
    PostDeletionService,
  ],
  exports: [
    PostService,
    PostQueryService,
    PostCreationService,
    PostUpdateService,
    PostDeletionService,
  ],
})
export class PostModule {}