import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { ApplicationConcernModule } from '../application/_concern';
import { ApplicationModule } from '../application/application.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { AdminBlockedIpsController, AdminCommentController, AdminController, AdminMediaApiController, AdminPostController, AdminSeriesController, AdminSeriesPostController, AdminTagController, AdminExcelToJsonController, FeedController, PatchNotesController, PostCommentController, PostController, SeriesController, SessionController, SitemapController } from './controllers';
import { AppExceptionFilter } from './filters';
import { LoggingInterceptor } from './interceptors';
import { RequestIdMiddleware, WAFMiddleware } from './middlewares';

@Module({
  imports: [
    InfrastructureModule,
    ApplicationModule,
    ApplicationConcernModule, // 리팩토링 후 제거해야함
  ],
  controllers: [
    // Web Controllers - 관리자용
    AdminController,
    AdminPostController,
    AdminSeriesController,
    AdminSeriesPostController,
    AdminCommentController,
    AdminBlockedIpsController,
    AdminTagController,
    AdminExcelToJsonController,

    // Web Controllers - 일반 사용자용
    FeedController,
    PostController,
    PostCommentController,
    SeriesController,
    SitemapController,
    PatchNotesController,
    SessionController,

    // API Controllers - 관리자용
    AdminMediaApiController,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AppExceptionFilter },
  ],
})
export class PresentationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      RequestIdMiddleware,
      WAFMiddleware
    ).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}