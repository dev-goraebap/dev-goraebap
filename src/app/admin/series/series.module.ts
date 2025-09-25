import { Module } from "@nestjs/common";

import { SeriesCommandService } from "./services/series-command.service";
import { SeriesPostCommandService } from "./services/series-post-command.service";
import { SeriesQueryService } from "./services/series-query.service";
import { AdminSeriesController } from "./web/series.controller";

@Module({
  imports: [],
  controllers: [AdminSeriesController],
  providers: [SeriesCommandService, SeriesPostCommandService, SeriesQueryService]
})
export class AdminSeriesModule {}