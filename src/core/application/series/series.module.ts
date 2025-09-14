import { Module } from '@nestjs/common';

import { ApplicationConcernModule } from '../_concern';
import { SeriesCommandService } from './orchestrators/series-command.service';
import { SeriesPostCommandService } from './orchestrators/series-post-command.service';
import { SeriesQueryService } from './orchestrators/series-query.service';
import { SeriesService } from './services/series.service';

const services = [
  SeriesService,
  SeriesQueryService,
  SeriesCommandService,
  SeriesPostCommandService
];

@Module({
  imports: [
    ApplicationConcernModule
  ],
  providers: [
    ...services
  ],
  exports: [
    ...services
  ],
})
export class SeriesModule { }