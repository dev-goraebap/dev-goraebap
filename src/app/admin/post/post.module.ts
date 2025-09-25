import { Module } from "@nestjs/common";

import { PostCommandService } from "./services/post-command.service";
import { AdminPostController } from "./web/post.controller";

@Module({
  imports: [],
  controllers: [AdminPostController],
  providers: [PostCommandService]
})
export class AdminPostModule {}