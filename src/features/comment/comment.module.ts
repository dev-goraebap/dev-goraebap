import { Module } from "@nestjs/common";
import { CommentQueryService } from "./comment-query.service";

@Module({
  imports: [],
  providers: [CommentQueryService],
  exports: [CommentQueryService]
})
export class FeatureCommentModule { }