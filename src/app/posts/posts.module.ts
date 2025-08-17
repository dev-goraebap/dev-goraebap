import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostEntity, TagEntity } from "src/shared";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, TagEntity])],
  controllers: [PostsController],
  providers: [PostsService]
})
export class PostsModule {}