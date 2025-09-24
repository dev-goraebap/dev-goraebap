import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SelectUser } from 'src/shared/drizzle';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SelectUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.currentUser as SelectUser;
  },
);