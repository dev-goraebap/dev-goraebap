import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';

import { UserQueryService } from '../services/user-query.service';
import { UserSessionService } from '../services/user-session.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly logger = new Logger(AdminAuthGuard.name);

  constructor(
    private readonly userQueryService: UserQueryService,
    private readonly userSessionService: UserSessionService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const session = req.session;

    if (!this.userSessionService.isAuthenticated(session)) {
      return false;
    }

    const userEmail = this.userSessionService.getUserEmail(session);
    if (!userEmail) {
      this.logger.warn('세션에 사용자 이메일이 없습니다.');
      return false;
    }

    const user = await this.userQueryService.findByEmail(userEmail);
    if (!user) {
      this.logger.warn('사용자를 찾을 수 없습니다.');
      return false;
    }

    req['currentUser'] = user;
    return true;
  }
}