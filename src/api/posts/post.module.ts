import { Module } from "@nestjs/common";
import { CommentModule } from "./comments";

@Module({
  imports: [CommentModule],
  exports: [CommentModule]
})
export class PostsModule {}