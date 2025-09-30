/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/logger/logger.service.ts
import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

import { DrizzleContext } from 'src/shared/drizzle';
import { appLogs } from 'src/shared/drizzle/schema/app-logs.schema';

export interface LogData {
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  userId?: number;
  sessionId?: string;
  requestId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  ipAddress?: string;
  errorMessage?: string;
  errorStack?: string;
  metadata?: any;
  tags?: string[];
}

@Injectable()
export class LoggerService {
  private logger: winston.Logger;
  private logQueue: LogData[] = [];
  private batchTimer?: NodeJS.Timeout;
  private readonly BATCH_SIZE = 50;
  private readonly BATCH_TIMEOUT = 5000; // 5초

  constructor() {
    // Winston 콘솔 로거 설정
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
              return `${timestamp} [${level}]: ${message}${metaStr}`;
            }),
          ),
        }),
      ],
    });

    // 배치 처리 시작
    this.startBatchProcessor();
  }

  // 기본 로깅 메서드들 (콘솔 + DB 저장)
  info(message: string, meta: any = {}) {
    // 콘솔에 즉시 출력
    this.logger.info(message, meta);

    // DB 저장 큐에 추가
    this.addToQueue({
      level: 'INFO',
      message,
      ...this.extractLogData(meta),
    });
  }

  error(message: string, meta: any = {}) {
    this.logger.error(message, meta);
    this.addToQueue({
      level: 'ERROR',
      message,
      errorMessage: meta.error || meta.errorMessage,
      errorStack: meta.stack || meta.trace,
      ...this.extractLogData(meta),
    });
  }

  warn(message: string, meta: any = {}) {
    this.logger.warn(message, meta);
    this.addToQueue({
      level: 'WARN',
      message,
      ...this.extractLogData(meta),
    });
  }

  debug(message: string, meta: any = {}) {
    this.logger.debug(message, meta);
    this.addToQueue({
      level: 'DEBUG',
      message,
      ...this.extractLogData(meta),
    });
  }

  // HTTP 요청 로깅 전용 메서드
  logHttpRequest(data: {
    method: string;
    url: string;
    statusCode: number;
    responseTime: number;
    userId?: number;
    requestId?: string;
    ipAddress?: string;
    sessionId?: string;
    error?: string;
  }) {
    const level = data.statusCode >= 400 ? 'ERROR' : 'INFO';
    const message = `${data.method} ${data.url} ${data.statusCode} ${data.responseTime}ms`;

    // 콘솔 출력
    this.logger.info(message, { type: 'http_request', ...data });

    // DB 저장
    this.addToQueue({
      level: level as any,
      message,
      method: data.method,
      url: data.url,
      statusCode: data.statusCode,
      responseTime: data.responseTime,
      userId: data.userId,
      requestId: data.requestId,
      ipAddress: data.ipAddress,
      sessionId: data.sessionId,
      errorMessage: data.error,
      tags: ['http-request'],
    });
  }

  // 비즈니스 이벤트 로깅
  logBusinessEvent(eventName: string, eventData: any, context?: any) {
    const message = `Business Event: ${eventName}`;

    this.logger.info(message, { eventName, eventData, ...context });

    this.addToQueue({
      level: 'INFO',
      message,
      metadata: { eventName, eventData },
      tags: ['business-event'],
      ...this.extractLogData(context || {}),
    });
  }

  // 보안 이벤트 로깅
  logSecurityEvent(eventType: string, message: string, context?: any) {
    const fullMessage = `Security Event: ${message}`;

    this.logger.warn(fullMessage, { eventType, ...context });

    this.addToQueue({
      level: 'WARN',
      message: fullMessage,
      metadata: { eventType },
      tags: ['security', eventType],
      ...this.extractLogData(context || {}),
    });
  }

  // 메타데이터에서 로그 데이터 추출
  private extractLogData(meta: any): Partial<LogData> {
    return {
      userId: meta.userId,
      sessionId: meta.sessionId,
      requestId: meta.requestId,
      method: meta.method,
      url: meta.url,
      statusCode: meta.statusCode,
      responseTime: meta.responseTime,
      ipAddress: meta.ipAddress,
      errorMessage: meta.errorMessage || meta.error,
      errorStack: meta.errorStack || meta.stack || meta.trace,
      metadata: this.cleanMetadata(meta),
      tags: meta.tags || [],
    };
  }

  // 메타데이터 정리 (중복 필드 제거)
  private cleanMetadata(meta: any) {
    const {
      userId,
      sessionId,
      requestId,
      method,
      url,
      statusCode,
      responseTime,
      ipAddress,
      errorMessage,
      errorStack,
      error,
      stack,
      trace,
      tags,
      ...cleanMeta
    } = meta;

    return Object.keys(cleanMeta).length > 0 ? cleanMeta : null;
  }

  // 로그 큐에 추가
  private addToQueue(logData: LogData) {
    this.logQueue.push(logData);

    // 큐가 가득 차면 즉시 저장
    if (this.logQueue.length >= this.BATCH_SIZE) {
      this.flushLogs();
    }
  }

  // 배치 처리 시작
  private startBatchProcessor() {
    this.batchTimer = setInterval(() => {
      if (this.logQueue.length > 0) {
        this.flushLogs();
      }
    }, this.BATCH_TIMEOUT);
  }

  // 큐에 있는 로그들을 DB에 저장
  private async flushLogs() {
    if (this.logQueue.length === 0) return;

    const batch = this.logQueue.splice(0, this.BATCH_SIZE);

    try {
      await this.saveBatchToDatabase(batch);
    } catch (error) {
      console.error('Failed to save log batch to database:', error);
      // 실패한 로그를 다시 큐 앞에 추가 (재시도)
      this.logQueue.unshift(...batch);
    }
  }

  // 배치로 DB에 저장
  private async saveBatchToDatabase(logs: LogData[]) {
    if (logs.length === 0) return;

    // LogData를 appLogs insert 형태로 변환
    const insertData = logs.map((log) => ({
      level: log.level,
      message: log.message,
      method: log.method || null,
      url: log.url || null,
      statusCode: log.statusCode || null,
      responseTime: log.responseTime || null,
      userId: log.userId || null,
      sessionId: log.sessionId || null,
      ipAddress: log.ipAddress || null,
      requestId: log.requestId || null,
      errorMessage: log.errorMessage || null,
      errorStack: log.errorStack || null,
      metadata: log.metadata || null,
      tags: log.tags && log.tags.length > 0 ? log.tags : null,
    }));

    await DrizzleContext.db().insert(appLogs).values(insertData);
  }

  // 앱 종료 시 남은 로그 저장
  async onApplicationShutdown() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    if (this.logQueue.length > 0) {
      await this.flushLogs();
    }
  }

  // 강제로 모든 로그 저장 (테스트용)
  async flush() {
    await this.flushLogs();
  }
}
