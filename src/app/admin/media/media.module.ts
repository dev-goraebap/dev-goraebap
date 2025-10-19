import { Module } from "@nestjs/common";

import { AdminMediaApiController } from "./media.controller";
import { MediaService } from "./media.service";

@Module({
  imports: [],
  controllers: [AdminMediaApiController],
  providers: [MediaService]
})
export class AdminMediaModule {}