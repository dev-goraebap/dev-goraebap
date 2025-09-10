import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TagEntity } from 'src/shared';
import { TagService } from './application/services/tag.service';
import { TagQueryService } from './application/services/tag-query.service';

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity])],
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