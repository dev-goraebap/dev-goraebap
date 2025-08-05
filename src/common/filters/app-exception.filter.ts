// src/exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcBaseExceptionHandler, NestMvcReq } from 'nestjs-mvc-tools';

@Catch()
export class AppExceptionFilter
  extends NestMvcBaseExceptionHandler
  implements ExceptionFilter
{
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const req: NestMvcReq = host.switchToHttp().getRequest();
    const res: Response = host.switchToHttp().getResponse();

    this.logger.warn(exception.message);

    // 제외된 경로외에는 모두 페이지 처리
    const excludes = ['/.well-known', '/api'];
    if (!excludes.some(x => req.originalUrl.startsWith(x))) {
      return this.handleMvcException(exception, req, res, this.logger);
    }

    // API 예외 처리 (JSON 응답)
    if (exception instanceof HttpException) {
      return res.json({
        status: exception.getStatus(),
        message: exception.message,
      });
    } else {
      return res.json({
        status: 500,
        message: exception.message,
      });
    }
  }
}
