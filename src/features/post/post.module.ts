import { Module } from "@nestjs/common";
import { PostQueryService } from "./post-query.service";
import { ViewCountUpdateService } from "./view-count-update.service";

@Module({
  providers: [ViewCountUpdateService, PostQueryService],
  exports: [ViewCountUpdateService, PostQueryService]
})
export class FeaturePostModule {}