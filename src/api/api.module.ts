import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

import { AppExceptionFilter, LoggingInterceptor, RequestIdMiddleware, WAFMiddleware } from "src/common";
import { AdminBlockedIpModule } from "./admin/blocked-ips";
import { AdminCommentModule } from "./admin/comments";
import { AdminMediaModule } from "./admin/media";
import { AdminTagModule } from "./admin/tags";
import { PostsModule } from "./posts";
import { SessionModule } from "./session";

@Module({
  imports: [
    AdminMediaModule,
    AdminBlockedIpModule,
    AdminCommentModule,
    AdminTagModule,
    SessionModule,
    PostsModule
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AppExceptionFilter },
  ],
})
export class ApiModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      RequestIdMiddleware,
      WAFMiddleware
    ).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}