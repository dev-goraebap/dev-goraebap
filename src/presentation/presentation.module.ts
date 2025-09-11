import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AppExceptionFilter, LoggingInterceptor, RequestIdMiddleware, WAFMiddleware } from 'src/common';
import { BlockedIpModule } from 'src/modules/blocked-ip';
import { CommentModule } from 'src/modules/comment';
import { MediaModule } from 'src/modules/media';
import { PostModule } from 'src/modules/post';
import { SeriesModule } from 'src/modules/series';
import { TagModule } from 'src/modules/tag';
import { UserModule } from 'src/modules/user';
import { AdminController } from 'src/tmp/admin/admin.controller';
import { AdminMediaApiController } from './controllers/api/v1/admin/media.controller';
import { AdminBlockedIpsController } from './controllers/web/admin/blocked-ip.controller';
import { AdminCommentController } from './controllers/web/admin/comment.controller';
import { AdminPostController } from './controllers/web/admin/post.controller';
import { AdminSeriesController } from './controllers/web/admin/series.controller';
import { FeedController } from './controllers/web/feed.controller';
import { PatchNotesController } from './controllers/web/patch-notes.controller';
import { PostController } from './controllers/web/post.controller';
import { SeriesController } from './controllers/web/series.controller';
import { SessionController } from './controllers/web/session.controller';
import { SitemapController } from './controllers/web/sitemap.controller';

@Module({
  imports: [
    // 도메인 모듈들
    PostModule,
    SeriesModule,
    CommentModule,
    TagModule,
    BlockedIpModule,
    MediaModule,
    UserModule,
  ],
  controllers: [
    // Web Controllers - 일반 사용자용
    FeedController,
    PostController,
    SeriesController,
    SitemapController,
    PatchNotesController,
    SessionController,

    // Web Controllers - 관리자용
    AdminController,
    AdminPostController,
    AdminSeriesController,
    AdminCommentController,
    AdminBlockedIpsController,

    // API Controllers - 관리자용
    AdminMediaApiController,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AppExceptionFilter },
  ],
})
export class AppRefactoredModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      RequestIdMiddleware,
      WAFMiddleware
    ).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}