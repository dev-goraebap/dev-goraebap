import { Module } from '@nestjs/common';

import { SessionModule } from '../session/session.module';
import { AdminController } from './admin.controller';
import { BlockedIpsModule } from './blocked-ips/blocked-ips.module';
import { CommentsModule } from './comments/comments.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { PostsModule } from './posts/posts.module';
import { SeriesModule } from './series/series.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    // prettier-ignore
    SessionModule,
    PostsModule,
    TagsModule,
    SeriesModule,
    CommentsModule,
    FileUploadModule,
    BlockedIpsModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
