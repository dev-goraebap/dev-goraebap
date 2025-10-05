import { Module } from "@nestjs/common";

import { AdminSeriesPostModule } from "./posts";
import { SeriesApplicationService } from "./series-application.service";
import { AdminSeriesController } from "./series.controller";

@Module({
  imports: [
    AdminSeriesPostModule
  ],
  controllers: [AdminSeriesController],
  providers: [
    SeriesApplicationService,
  ]
})
export class AdminSeriesModule { }