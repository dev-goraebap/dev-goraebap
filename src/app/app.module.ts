import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

import { AppExceptionFilter, LoggingInterceptor, RequestIdMiddleware, WAFMiddleware } from "src/common";
import { AdminBlockedIpModule } from "./admin/blocked-ips";
import { AdminCommentModule } from "./admin/comments";
import { AdminMediaModule } from "./admin/media";
import { AdminPostModule } from "./admin/posts";
import { AdminSeriesModule } from "./admin/series";
import { AdminTagModule } from "./admin/tags";
import { FeedModule } from "./feed/feed.module";
import { PatchNoteModule } from "./patch-notes";
import { PostsModule } from "./posts";
import { SeriesModule } from "./series";
import { SessionModule } from "./session";
import { SitemapModule } from "./sitemap";

@Module({
  imports: [
    AdminPostModule,
    AdminSeriesModule,
    AdminMediaModule,
    AdminBlockedIpModule,
    AdminCommentModule,
    AdminTagModule,
    SessionModule,
    PostsModule,
    FeedModule,
    SeriesModule,
    PatchNoteModule,
    SitemapModule,
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