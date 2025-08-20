import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AppExceptionFilter } from 'src/common';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { PatchNotesModule } from './patch-notes/patch-notes.module';
import { FeedService } from './feed.service';
import { InitService } from './init.service';
import { FeedModule } from './posts/posts.module';
import { SeriesModule } from './series/series.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [AdminModule, SessionModule, FeedModule, SeriesModule, PatchNotesModule],
  controllers: [AppController],
  providers: [{ provide: APP_FILTER, useClass: AppExceptionFilter }, FeedService, InitService],
})
export class AppModule {}
