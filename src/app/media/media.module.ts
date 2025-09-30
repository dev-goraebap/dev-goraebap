import { Module } from "@nestjs/common";

import { AdminMediaApiController } from "./api/media.controller";
import { MediaApplicationService } from "./media-application.service";
import { MediaCleanupService } from "./media-cleanup.service";

@Module({
  imports: [],
  controllers: [AdminMediaApiController],
  providers: [MediaApplicationService, MediaCleanupService]
})
export class MediaModule {}