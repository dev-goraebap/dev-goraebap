import { Module } from "@nestjs/common";

import { AdminMediaApiController } from "./api/media.controller";
import { MediaCleanupService } from "./services/media-cleanup.service";
import { MediaUploadService } from "./services/media-upload.service";

@Module({
  imports: [],
  controllers: [AdminMediaApiController],
  providers: [MediaCleanupService, MediaUploadService]
})
export class MediaModule {}