import { Module } from "@nestjs/common";

import { CuratedItemsCommandService } from "./curated-items-command.service";
import { AdminCuratedItemsController } from "./curated-items.controller";

@Module({
  imports: [],
  controllers: [AdminCuratedItemsController],
  providers: [CuratedItemsCommandService]
})
export class AdminCuratedItemsModule {}