import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { LoggerService } from 'src/shared/logger';
import { getRealClientIp } from 'src/shared/utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          this.logger.logHttpRequest({
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            responseTime: Date.now() - startTime,
            userId: request.user?.id,
            requestId: request.headers['x-request-id'],
            ipAddress: getRealClientIp(request),
            sessionId: request.sessionID,
          });
        },
      }),
    );
  }
}
