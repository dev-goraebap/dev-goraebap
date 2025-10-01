import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { AdminAuthGuard, ZodValidationPipe } from 'src/common';
import { LoginDto, loginSchema } from './dto/login.dto';
import { SessionApplicationService } from './session-application.service';

@Controller('session')
export class SessionController {
  constructor(
    private readonly sessionApplicationService: SessionApplicationService
  ) { }

  @Get('login')
  async loginForm(@Req() req: NestMvcReq, @Res() res: Response) {
    if (this.sessionApplicationService.isAuthenticated(req.session)) {
      return res.redirect('/admin');
    }
    const template = await req.view.render('pages/session/login');
    return res.send(template);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() body: LoginDto, @Req() req: NestMvcReq) {
    await this.sessionApplicationService.login(body.email);

    return req.view.render('pages/session/auth-success', {
      message: '매직링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.',
    });
  }

  @Get('verify')
  verify(
    @Query('token') token: string,
    @Req() req: NestMvcReq,
    @Res() res: Response,
  ) {
    if (!token) {
      throw new ForbiddenException('유효하지 않은 접근입니다.');
    }

    const payload = this.sessionApplicationService.verifyToken(token);
    if (!payload) {
      throw new ForbiddenException('링크가 만료되었거나 유효하지 않습니다.');
    }

    const sessionData = this.sessionApplicationService.createSession(payload.email);
    req.session['isAuthenticated'] = sessionData.isAuthenticated;
    req.session['userEmail'] = sessionData.userEmail;

    return res.redirect('/admin');
  }

  @Post('logout')
  @UseGuards(AdminAuthGuard)
  logout(@Req() req: NestMvcReq, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
    });
    return res.redirect('/session/login');
  }
}