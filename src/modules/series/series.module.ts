import { Module } from '@nestjs/common';

import { SeriesCommandService } from './application/orchestrators/series-command.service';
import { SeriesQueryService } from './application/orchestrators/series-query.service';
import { SeriesService } from './application/services/series.service';

@Module({
  providers: [
    // Level 1: 순수 도메인 서비스
    SeriesService,
    SeriesQueryService,
    SeriesCommandService
  ],
  exports: [
    SeriesService,
    SeriesQueryService,
    SeriesCommandService
  ],
})
export class SeriesModule {}