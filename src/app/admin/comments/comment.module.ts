import { Module } from "@nestjs/common";

import { CommentCommandService } from "./comment-command.service";
import { AdminCommentController } from "./comment.controller";

@Module({
  imports: [],
  controllers: [AdminCommentController],
  providers: [CommentCommandService]
})
export class AdminCommentModule {}