// src/exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcBaseExceptionHandler, NestMvcReq } from 'nestjs-mvc-tools';

import { LoggerService } from 'src/shared/logger';
import { getRealClientIp } from 'src/shared/utils';

@Catch()
export class AppExceptionFilter extends NestMvcBaseExceptionHandler implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const req: NestMvcReq = host.switchToHttp().getRequest();
    const res: Response = host.switchToHttp().getResponse();
    const startTime = Date.now();

    // 에러 정보 준비
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : 500;
    const errorMessage = exception.message;

    // 상세 에러 로깅
    const logData = {
      message: errorMessage,
      statusCode: status,
      method: req.method,
      url: req.originalUrl || req.url,
      userAgent: req.headers['user-agent'],
      ipAddress: getRealClientIp(req),
      userId: req['user']?.id, // 인증된 사용자가 있다면
      requestId: req.headers['x-request-id'], // request ID가 있다면
      stack: exception.stack,
      exceptionType: isHttpException ? 'HttpException' : 'Error',
      responseTime: startTime ? Date.now() - startTime : undefined,
      tags: ['exception', 'global-filter', status >= 500 ? 'server-error' : 'client-error'],
    };

    if (status >= 500) {
      this.logger.error('Exception caught in global filter', logData);
    } else {
      this.logger.warn('Exception caught in global filter', logData);
    }

    // 제외된 경로외에는 모두 페이지 처리
    const excludes = ['/.well-known', '/api'];
    if (!excludes.some((x) => req.originalUrl.startsWith(x))) {
      return this.handleMvcException(exception, req, res, null);
    }

    // API 예외 처리 (JSON 응답)
    if (isHttpException) {
      return res.json({
        status,
        message: errorMessage,
      });
    } else {
      // 예상치 못한 서버 에러의 경우 추가 로깅
      this.logger.error('Unexpected server error', {
        message: 'Internal server error occurred',
        originalError: errorMessage,
        stack: exception.stack,
        method: req.method,
        url: req.originalUrl || req.url,
        userId: req['user']?.id,
        tags: ['critical', 'unhandled-error'],
      });

      return res.json({
        status: 500,
        message: 'Internal Server Error', // 사용자에게는 일반적인 메시지
      });
    }
  }
}
