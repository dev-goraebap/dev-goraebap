import { Module } from "@nestjs/common";

import { CommentCommandService } from "./services/comment-command.service";
import { CommentQueryService } from "./services/comment-query.service";
import { PostCommentController } from "./web/comment.controller";

@Module({
  imports: [],
  controllers: [PostCommentController],
  providers: [CommentCommandService, CommentQueryService],
})
export class CommentModule {}