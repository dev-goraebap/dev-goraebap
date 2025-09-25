import { Module } from "@nestjs/common";

import { CommentQueryService } from "./services/comment-query.service";
import { AdminCommentController } from "./web/comment.controller";

@Module({
  imports: [],
  controllers: [AdminCommentController],
  providers: [CommentQueryService]
})
export class AdminCommentModule {}