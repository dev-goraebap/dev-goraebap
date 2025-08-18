import { Module } from '@nestjs/common';

import { SeriesPostsController } from './controllers/series-posts.controller';
import { SeriesController } from './controllers/series.controller';
import { SeriesPostsService } from './services/series-posts.service';
import { SeriesService } from './services/series.service';
import { CreateSeriesUseCase } from './use-cases/create-series.use-case';
import { DestroySeriesUseCase } from './use-cases/destroy-series.use-case';
import { UpdateSeriesUseCase } from './use-cases/update-series.use-case';

@Module({
  controllers: [SeriesController, SeriesPostsController],
  providers: [
    SeriesService,
    SeriesPostsService,
    CreateSeriesUseCase,
    UpdateSeriesUseCase,
    DestroySeriesUseCase
  ]
})
export class SeriesModule {}
