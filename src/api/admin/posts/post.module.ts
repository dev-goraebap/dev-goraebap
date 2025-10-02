import { Module } from "@nestjs/common";

import { PostApplicationService } from "./post-application.service";
import { AdminPostController } from "./post.controller";

@Module({
  imports: [],
  controllers: [AdminPostController],
  providers: [PostApplicationService]
})
export class AdminPostModule {}