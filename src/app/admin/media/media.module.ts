import { Module } from "@nestjs/common";

import { MediaApplicationService } from "./media-application.service";
import { AdminMediaApiController } from "./media.controller";

@Module({
  imports: [],
  controllers: [AdminMediaApiController],
  providers: [MediaApplicationService]
})
export class AdminMediaModule {}