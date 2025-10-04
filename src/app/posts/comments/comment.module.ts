import { Module } from "@nestjs/common";

import { CommentApplicationService } from "./comment-application.service";
import { PostCommentController } from "./comment.controller";

@Module({
  imports: [],
  controllers: [PostCommentController],
  providers: [CommentApplicationService],
})
export class CommentModule {}