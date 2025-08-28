import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from 'src/shared';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly logger = new Logger(AdminAuthGuard.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const session = req.session;

    return true;

    if (!session?.isAuthenticated) {
      return false;
    }

    const user = await this.userRepository.findOne({
      where: {
        email: session?.userEmail,
      },
    });
    if (!user) {
      this.logger.warn('사용자를 찾을 수 없습니다.');
      return false;
    }

    req['currentUser'] = user;
    return true;
  }
}
