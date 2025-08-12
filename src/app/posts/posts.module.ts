import { Module } from "@nestjs/common";
import { PostsController } from "./posts.controller";

@Module({
  imports: [],
  controllers: [PostsController]
})
export class PostsModule {}