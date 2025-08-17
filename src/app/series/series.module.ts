import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity, SeriesEntity } from 'src/shared';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';

@Module({
  imports: [TypeOrmModule.forFeature([SeriesEntity, PostEntity])],
  controllers: [SeriesController],
  providers: [SeriesService]
})
export class SeriesModule {}
