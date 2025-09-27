import { Module } from "@nestjs/common";

import { AdminPostController } from "./web/admin/post.controller";
import { PostController } from "./web/post.controller";

@Module({
  imports: [],
  controllers: [
    PostController,
    AdminPostController
  ],
  providers: [],
  exports: []
})
export class PostModule { }