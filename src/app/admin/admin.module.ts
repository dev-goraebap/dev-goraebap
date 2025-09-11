import { Module } from '@nestjs/common';

// import { SessionModule } from '../session/session.module'; // 제거됨 - User 도메인으로 이동
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
    // SessionModule, // 제거됨 - User 도메인으로 이동
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
