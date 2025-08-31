import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AttachmentEntity,
  BlobEntity,
  BlockedIpEntity,
  CommentEntity,
  PostEntity,
  SeriesEntity,
  SeriesPostEntity,
  TagEntity,
  UserEntity,
} from './entities';
import { AttachmentSharedService, CommentsSharedService, PostsSharedService } from './services';
import { TagsSharedService } from './services/tags-shared.service';

const services = [
  // prettier-ignore
  TagsSharedService,
  AttachmentSharedService,
  PostsSharedService,
  CommentsSharedService,
];

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
  providers: [...services],
  exports: [...services, TypeOrmModule],
})
export class SharedModule {}
