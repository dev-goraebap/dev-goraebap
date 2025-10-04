import { Module } from "@nestjs/common";

import { SeriesApplicationService } from "./series-application.service";
import { AdminSeriesController } from "./series.controller";

@Module({
  imports: [],
  controllers: [AdminSeriesController],
  providers: [
    SeriesApplicationService,
  ]
})
export class AdminSeriesModule {}