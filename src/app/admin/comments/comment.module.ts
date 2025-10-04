import { Module } from "@nestjs/common";

import { CommentApplicationService } from "./comment-application.service";
import { AdminCommentController } from "./comment.controller";

@Module({
  imports: [],
  controllers: [AdminCommentController],
  providers: [CommentApplicationService]
})
export class AdminCommentModule {}