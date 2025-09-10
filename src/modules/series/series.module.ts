import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeriesEntity, SeriesPostEntity, PostEntity } from 'src/shared';
import { SeriesService } from './application/services/series.service';
import { SeriesQueryService } from './application/services/series-query.service';

@Module({
  imports: [TypeOrmModule.forFeature([SeriesEntity, SeriesPostEntity, PostEntity])],
  providers: [
    // Level 1: 순수 도메인 서비스
    SeriesService,
    SeriesQueryService,
  ],
  exports: [
    SeriesService,
    SeriesQueryService,
  ],
})
export class SeriesModule {}