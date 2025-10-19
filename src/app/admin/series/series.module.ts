import { Module } from "@nestjs/common";

import { AdminSeriesPostModule } from "./posts";
import { SeriesCommandService } from "./series-command.service";
import { AdminSeriesController } from "./series.controller";

@Module({
  imports: [
    AdminSeriesPostModule
  ],
  controllers: [AdminSeriesController],
  providers: [
    SeriesCommandService,
  ]
})
export class AdminSeriesModule { }