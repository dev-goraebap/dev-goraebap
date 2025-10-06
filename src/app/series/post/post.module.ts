import { Module } from "@nestjs/common";

import { PostQueryService } from "src/infra/queries";
import { SeriesPostController } from "./post.controller";

@Module({
  providers: [PostQueryService],
  controllers: [SeriesPostController],
})
export class SeriesPostModule {}