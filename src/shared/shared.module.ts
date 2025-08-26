import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AttachmentEntity,
  BlobEntity,
  CommentEntity,
  PostEntity,
  SeriesEntity,
  SeriesPostEntity,
  TagEntity,
  UserEntity,
} from './entities';
import { AttachmentSharedService, CommentsSharedService, PostsSharedService } from './services';
import { TagsSharedService } from './services/tags-shared.service';

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
    ]),
  ],
  providers: [TagsSharedService, AttachmentSharedService, PostsSharedService, CommentsSharedService],
  exports: [TagsSharedService, AttachmentSharedService, PostsSharedService, CommentsSharedService, TypeOrmModule],
})
export class SharedModule {}
