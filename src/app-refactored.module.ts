import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AppExceptionFilter, LoggingInterceptor, RequestIdMiddleware, WAFMiddleware } from 'src/common';

// 새로운 모듈 구조
import { 
  PostModule, 
  SeriesModule, 
  CommentModule, 
  TagModule, 
  BlockedIpModule, 
  MediaModule,
  UserModule
} from './modules';

// 컨트롤러들
import { 
  // Web Controllers - 일반 사용자용
  FeedController,
  PostController, 
  SeriesController,
  SitemapController,
  PatchNotesController,
  SessionController,
  
  // Web Controllers - 관리자용
  AdminController,
  AdminPostsController,
  
  // API Controllers - 관리자용
  AdminPostsApiController,
  AdminMediaApiController
} from './controllers';

// 기존에 유지되는 모듈들 (아직 리팩토링되지 않음)
// import { SeoModule } from './app/seo/seo.module';
// import { AdminModule } from './app/admin/admin.module';

import { InitService } from './app/init.service';

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
    AdminPostsController,
    
    // API Controllers - 관리자용
    AdminPostsApiController,
    AdminMediaApiController,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AppExceptionFilter },
    InitService,
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