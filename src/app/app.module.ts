import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

import { AppExceptionFilter, LoggingInterceptor, RequestIdMiddleware, WAFMiddleware } from "src/common";
import { AdminCreationService } from "src/features/create-admin";
import { AdminModule } from "./admin/admin.module";
import { CommentModule } from "./comment/comment.module";
import { FeedModule } from "./feed/feed.module";
import { PatchNoteModule } from "./patch-notes/patch-note.module";
import { SeriesModule } from "./series/series.module";
import { SessionModule } from "./session/session.module";
import { SitemapModule } from "./sitemap/sitemap.module";

@Module({
  imports: [
    AdminModule,
    CommentModule,
    FeedModule,
    PatchNoteModule,
    SeriesModule,
    SessionModule,
    SitemapModule
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AppExceptionFilter },
    AdminCreationService
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