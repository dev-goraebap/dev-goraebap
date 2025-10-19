import { Module } from "@nestjs/common";

import { CommentCommandService } from "./comment-command.service";
import { PostCommentController } from "./comment.controller";

@Module({
  imports: [],
  controllers: [PostCommentController],
  providers: [CommentCommandService],
})
export class CommentModule {}