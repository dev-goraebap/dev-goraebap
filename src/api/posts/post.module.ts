import { Module } from "@nestjs/common";

import { CommentModule } from "./comments";
import { PostController } from "./post.controlloler";

@Module({
  imports: [CommentModule],
  controllers: [PostController],
  exports: [CommentModule]
})
export class PostsModule { }