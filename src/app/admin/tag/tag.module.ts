import { Module } from "@nestjs/common";

import { TagCommandService } from "./services/tag-command.service";
import { TagQueryService } from "./services/tag-query.service";
import { AdminTagController } from "./web/tag.controller";

@Module({
  imports: [],
  controllers: [AdminTagController],
  providers: [TagCommandService, TagQueryService]
})
export class AdminTagModule {}