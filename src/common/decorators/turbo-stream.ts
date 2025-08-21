import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IsTurboStream = createParamDecorator((data: unknown, ctx: ExecutionContext): boolean => {
  const request = ctx.switchToHttp().getRequest();
  const acceptHeader = (request.headers.accept as string) || '';
  return acceptHeader.includes('text/vnd.turbo-stream.html');
});
