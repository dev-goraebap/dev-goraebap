import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostEntity, TagEntity } from 'src/shared';
import { PostService } from './application/services/post.service';
import { PostQueryService } from './application/services/post-query.service';
import { PostFeedService } from './application/services/post-feed.service';
import { PostPatchNotesService } from './application/services/post-patch-notes.service';
import { PostCreationService } from './application/orchestrators/post-creation.service';
import { PostUpdateService } from './application/orchestrators/post-update.service';
import { PostDeletionService } from './application/orchestrators/post-deletion.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, TagEntity])],
  providers: [
    // Level 1: 순수 도메인 서비스
    PostService,
    PostQueryService,
    PostFeedService,
    PostPatchNotesService,
    
    // Level 2: 오케스트레이션 서비스
    PostCreationService,
    PostUpdateService,
    PostDeletionService,
  ],
  exports: [
    PostService,
    PostQueryService,
    PostFeedService,
    PostPatchNotesService,
    PostCreationService,
    PostUpdateService,
    PostDeletionService,
  ],
})
export class PostModule {}