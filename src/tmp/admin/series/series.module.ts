import { Module } from '@nestjs/common';

import { SeriesApplicationService } from './series-application.service';
import { SeriesPostsController } from './series-posts.controller';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';

@Module({
  controllers: [SeriesController, SeriesPostsController],
  providers: [SeriesService, SeriesApplicationService],
})
export class SeriesModule {}
