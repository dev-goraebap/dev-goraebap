import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AppExceptionFilter } from 'src/common';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { FeedService } from './feed.service';
import { FeedModule } from './posts/posts.module';
import { SeriesModule } from './series/series.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [AdminModule, SessionModule, FeedModule, SeriesModule],
  controllers: [AppController],
  providers: [{ provide: APP_FILTER, useClass: AppExceptionFilter }, FeedService],
})
export class AppModule {}
