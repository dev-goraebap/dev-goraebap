import { Module } from "@nestjs/common";
import { SeriesController } from "./web/series.controller";

@Module({
  imports: [],
  controllers: [SeriesController],
  providers: [],
})
export class SeriesModule {}