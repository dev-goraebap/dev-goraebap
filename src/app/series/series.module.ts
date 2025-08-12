import { Module } from '@nestjs/common';
import { SeriesController } from './series.controller';

@Module({
  imports: [],
  controllers: [SeriesController],
})
export class SeriesModule {}
