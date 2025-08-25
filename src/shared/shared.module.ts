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
import { TagsSharedService } from './services/tags-shared.service';
import { AttachmentSharedService } from './services';

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
  providers: [TagsSharedService, AttachmentSharedService],
  exports: [TagsSharedService, AttachmentSharedService, TypeOrmModule],
})
export class SharedModule {}
