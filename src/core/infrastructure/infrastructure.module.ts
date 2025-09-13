import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AttachmentEntity, BlobEntity, BlockedIpEntity, CommentEntity, PostEntity, SeriesEntity, SeriesPostEntity, TagEntity, UserEntity } from "./entities";
import { BlockedIpRepository, SeriesRepository, TagRepository } from "./repositories";
import { CommentRepository } from "./repositories/comment.repository";
import { PostRepository } from "./repositories/post.repository";
import { CloudflareR2Service, GoogleImageService } from "./services";

const services = [
  GoogleImageService,
  CloudflareR2Service
];

const repositories = [
  PostRepository,
  TagRepository,
  CommentRepository,
  BlockedIpRepository,
  SeriesRepository
]

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      PostEntity,
      TagEntity,
      SeriesEntity,
      SeriesPostEntity,
      BlobEntity,
      AttachmentEntity,
      CommentEntity,
      BlockedIpEntity
    ]),
  ],
  providers: [...services, ...repositories],
  exports: [...services, ...repositories, TypeOrmModule]
})
export class InfrastructureModule { }