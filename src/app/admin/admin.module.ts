import { Module } from '@nestjs/common';

import { SessionModule } from '../session/session.module';
import { AdminController } from './admin.controller';
import { CommentsModule } from './comments/comments.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { PostsModule } from './posts/posts.module';
import { SeriesModule } from './series/series.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [SessionModule, PostsModule, TagsModule, SeriesModule, CommentsModule, FileUploadModule],
  controllers: [AdminController],
})
export class AdminModule {}
