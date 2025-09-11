import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AppExceptionFilter, LoggingInterceptor, RequestIdMiddleware, WAFMiddleware } from 'src/common';
import { AdminModule } from './admin/admin.module';
import { CommentsModule } from './comments/comments.module';
// import { FeedModule } from './feed/feed.module'; // 제거됨 - Post 도메인으로 이동
import { InitService } from './init.service';
// import { PatchNotesModule } from './patch-notes/patch-notes.module'; // 제거됨 - Post 도메인으로 이동
import { PostsModule } from './posts/posts.module';
import { SeoModule } from './seo/seo.module';
import { SeriesModule } from './series/series.module';
// import { SessionModule } from './session/session.module'; // 제거됨 - User 도메인으로 이동

@Module({
  imports: [
    // FeedModule, // 제거됨 - Post 도메인으로 이동
    PostsModule,
    SeriesModule,
    // PatchNotesModule, // 제거됨 - Post 도메인으로 이동
    // SessionModule, // 제거됨 - User 도메인으로 이동
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
