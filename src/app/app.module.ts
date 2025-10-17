import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

import { AppExceptionFilter, LoggingInterceptor, RequestIdMiddleware, WAFMiddleware } from "src/common";
import { AdminModule } from "./admin/admin.module";
import { CurationModule } from "./curation";
import { FeedModule } from "./feed/feed.module";
import { PatchNoteModule } from "./patch-notes";
import { PostsModule } from "./posts";
import { SeriesModule } from "./series";
import { SessionModule } from "./session";
import { SitemapModule } from "./sitemap";

@Module({
  imports: [
    SitemapModule,
    AdminModule,
    SessionModule,
    PostsModule,
    FeedModule,
    SeriesModule,
    PatchNoteModule,
    CurationModule
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AppExceptionFilter },
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