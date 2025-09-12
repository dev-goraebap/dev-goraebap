import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/core/infrastructure/entities';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.currentUser as UserEntity;
  },
);