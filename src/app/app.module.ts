import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AppExceptionFilter } from 'src/common';
import { AdminModule } from './admin/admin.module';
import { FeedModule } from './feed/feed.module';
import { FeedService } from './feed/feed.service';
import { InitService } from './init.service';
import { PatchNotesModule } from './patch-notes/patch-notes.module';
import { PostsModule } from './posts/posts.module';
import { SeriesModule } from './series/series.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [FeedModule, PostsModule, SeriesModule, PatchNotesModule, SessionModule, AdminModule],
  providers: [{ provide: APP_FILTER, useClass: AppExceptionFilter }, FeedService, InitService],
})
export class AppModule {}
