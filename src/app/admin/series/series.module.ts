import { Module } from '@nestjs/common';

import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';
import { CreateSeriesUseCase } from './use-cases/create-series.use-case';
import { DestroySeriesUseCase } from './use-cases/destroy-series.use-case';
import { UpdateSeriesUseCase } from './use-cases/update-series.use-case';

@Module({
  controllers: [SeriesController],
  providers: [
    SeriesService,
    CreateSeriesUseCase,
    UpdateSeriesUseCase,
    DestroySeriesUseCase
  ]
})
export class SeriesModule {}
