import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

import { AppExceptionFilter, LoggingInterceptor, RequestIdMiddleware, WAFMiddleware } from "src/common";
import { AdminBlockedIpModule } from "./admin/blocked-ips";
import { AdminMediaModule } from "./admin/media";
import { SessionModule } from "./session";

@Module({
  imports: [
    SessionModule,
    AdminMediaModule,
    AdminBlockedIpModule
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