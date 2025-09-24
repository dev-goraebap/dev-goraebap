import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, DrizzleOrm, users } from 'src/shared/drizzle';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly logger = new Logger(AdminAuthGuard.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
  ) { }

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const session = req.session;

    if (!session?.isAuthenticated) {
      return false;
    }

    const user = await this.drizzle.query.users.findFirst({
      where: eq(users.email, session?.userEmail)
    });
    if (!user) {
      this.logger.warn('사용자를 찾을 수 없습니다.');
      return false;
    }

    req['currentUser'] = user;
    return true;
  }
}
