import { Global, Module } from "@nestjs/common";

import { GoogleImageService } from "./google-image.service";

@Global()
@Module({
  providers: [GoogleImageService],
  exports: [GoogleImageService]
})
export class GoogleVisionAiModule {}