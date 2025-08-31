import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AppExceptionFilter, LoggingInterceptor, RequestIdMiddleware, WAFMiddleware } from 'src/common';
import { AdminModule } from './admin/admin.module';
import { CommentsModule } from './comments/comments.module';
import { FeedModule } from './feed/feed.module';
import { InitService } from './init.service';
import { PatchNotesModule } from './patch-notes/patch-notes.module';
import { PostsModule } from './posts/posts.module';
import { SeoModule } from './seo/seo.module';
import { SeriesModule } from './series/series.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    FeedModule,
    PostsModule,
    SeriesModule,
    PatchNotesModule,
    SessionModule,
    AdminModule,
    SeoModule,
    CommentsModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AppExceptionFilter },
    InitService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      RequestIdMiddleware,
      WAFMiddleware
    ).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
