import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';

import { blockedIps, DRIZZLE, DrizzleOrm } from 'src/shared/drizzle';
import { LoggerService } from 'src/shared/logger';
import { getRealClientIp } from 'src/shared/utils';

@Injectable()
export class WAFMiddleware implements NestMiddleware {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly logger: LoggerService,
  ) { }

  // 악성 경로 패턴들
  private readonly MALICIOUS_PATHS = [
    // PHP 관련 스캔
    /\.php$/i,
    /\/systembc\//i,
    /\/password\.php$/i,
    /\/admin\.php$/i,
    /\/wp-admin/i,
    /\/wp-login\.php$/i,
    /\/wp-config\.php$/i,

    // 환경 설정 파일 스캔
    /\/\.env$/i,
    /\/\.git\//i,
    /\/\.svn\//i,
    /\/config\.php$/i,
    /\/database\.php$/i,

    // 일반적인 취약점 스캔
    /\/backup/i,
    /\/phpmyadmin/i,
    /\/adminer/i,
    /\/sql/i,
    /\/xmlrpc\.php$/i,
    /\/readme\.txt$/i,
    /\/license\.txt$/i,

    // API 스캔
    /\/api\/v1\/users/i,
    /\/rest\/api/i,

    // 디렉토리 스캔
    /\/uploads\//i,
    /\/assets\//i,
    /\/files\//i,
    /\/temp\//i,
  ];

  // 악성 User-Agent 패턴들
  private readonly MALICIOUS_USER_AGENTS = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scanner/i,
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zgrab/i,
    /shodan/i,
    /censys/i,
  ];

  async use(req: Request, res: Response, next: NextFunction) {
    const clientIp = getRealClientIp(req);
    const userAgent = req.get('User-Agent') || '';
    const requestPath = req.path;

    try {
      // 1. IP 차단 목록 확인
      if (await this.isIPBlocked(clientIp)) {
        return this.blockRequest(res, 'IP_BLOCKED', clientIp, requestPath, userAgent);
      }

      // 2. 악성 경로 패턴 확인
      if (this.isMaliciousPath(requestPath)) {
        await this.autoBlockIP(clientIp, `Malicious path access: ${requestPath}`, requestPath, userAgent);
        return this.blockRequest(res, 'MALICIOUS_PATH', clientIp, requestPath, userAgent);
      }

      // 3. 악성 User-Agent 확인
      if (this.isMaliciousUserAgent(userAgent)) {
        await this.autoBlockIP(clientIp, `Malicious User-Agent: ${userAgent}`, requestPath, userAgent);
        return this.blockRequest(res, 'MALICIOUS_USER_AGENT', clientIp, requestPath, userAgent);
      }

      // 4. 허용된 요청
      next();
    } catch (error) {
      this.logger.error('WAF Middleware error', { error: error.message, stack: error.stack, ipAddress: clientIp });
      next(); // 에러 시 통과시킴 (가용성 우선)
    }
  }


  private async isIPBlocked(ipAddress: string): Promise<boolean> {
    const blocked = await this.drizzle.query.blockedIps.findFirst({
      where: and(
        eq(blockedIps.ipAddress, ipAddress),
        eq(blockedIps.isActiveYn, 'Y')
      )
    });
    if (!blocked) return false;

    // 만료 시간 확인
    if (blocked.expiresAt && new Date() > new Date(blocked.expiresAt)) {
      await this.drizzle
        .update(blockedIps)
        .set({
          ipAddress,
          isActiveYn: 'N'
        })
        .where(eq(blockedIps.id, blocked.id));
      return false;
    }

    return blocked.isActiveYn === 'Y';
  }

  private isMaliciousPath(path: string): boolean {
    return this.MALICIOUS_PATHS.some((pattern) => pattern.test(path));
  }

  private isMaliciousUserAgent(userAgent: string): boolean {
    if (!userAgent || userAgent.length < 5) return true; // 빈 UA도 의심스러움
    return this.MALICIOUS_USER_AGENTS.some((pattern) => pattern.test(userAgent));
  }

  private async autoBlockIP(ipAddress: string, reason: string, path: string, userAgent: string): Promise<void> {
    try {
      const existingBlock = await this.drizzle.query.blockedIps.findFirst({
        where: eq(blockedIps.ipAddress, ipAddress)
      });
      if (!existingBlock) {
        await this.drizzle
          .insert(blockedIps)
          .values({
            ipAddress,
            reason,
            blockedBy: 'auto',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24시간 후 만료
            isActiveYn: 'Y',
          });

        // 자동 차단 이벤트 로깅
        this.logger.logSecurityEvent('AUTO_BLOCKED', `IP ${ipAddress} automatically blocked`, {
          ipAddress,
          reason,
          path,
          userAgent,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      }
    } catch (error) {
      this.logger.error('Failed to auto-block IP', { error: error.message, ipAddress });
    }
  }

  private blockRequest(res: Response, reason: string, ip: string, path: string, userAgent: string): void {
    // 보안 이벤트 로깅
    this.logger.logSecurityEvent(reason, `Request blocked from IP ${ip}`, {
      ipAddress: ip,
      path,
      userAgent,
      blockReason: reason,
    });

    res.status(403).end();
  }
}
