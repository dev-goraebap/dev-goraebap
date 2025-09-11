import { Module } from '@nestjs/common';

import { TagQueryService } from './application/orchestrators/tag-query.service';
import { TagService } from './application/services/tag.service';

@Module({
  providers: [
    // Level 1: 순수 도메인 서비스
    TagService,
    TagQueryService,
  ],
  exports: [
    TagService,
    TagQueryService,
  ],
})
export class TagModule {}