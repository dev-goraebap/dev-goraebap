import { Module } from "@nestjs/common";

import { AdminPostController } from "./post.controller";
import { PostCommandService } from "./post.service";

@Module({
  imports: [],
  controllers: [AdminPostController],
  providers: [PostCommandService]
})
export class AdminPostModule {}