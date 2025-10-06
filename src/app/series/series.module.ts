import { Module } from "@nestjs/common";

import { SeriesPostModule } from "./post/post.module";
import { SeriesController } from "./series.controller";

@Module({
  imports: [SeriesPostModule],
  controllers: [SeriesController],
  providers: [],
})
export class SeriesModule {}