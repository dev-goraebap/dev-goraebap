import { Module } from '@nestjs/common';

import { PostCommandService } from './application/orchestrators/post-command.service';
import { PostQueryService } from './application/orchestrators/post-query.service';
import { PostFeedService } from './application/services/post-feed.service';
import { PostPatchNotesService } from './application/services/post-patch-notes.service';
import { PostService } from './application/services/post.service';

@Module({
  providers: [
    // Level 1: 순수 도메인 서비스
    PostService,
    PostFeedService,
    PostPatchNotesService,

    // Level 2: 오케스트레이션 서비스
    PostQueryService,
    PostCommandService,
  ],
  exports: [
    PostService,
    PostFeedService,
    PostPatchNotesService,
    PostQueryService,
    PostCommandService,
  ],
})
export class PostModule { }