import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CommentEntity } from "src/shared";
import { PostEntity, TagEntity } from ".";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      TagEntity,
      CommentEntity
    ])
  ],
  exports: []
})
export class PostSharedModule { }