import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { AdminAuthGuard, ZodValidationPipe } from 'src/common';
import { AuthService } from './auth.service';
import { LoginDto, loginSchema } from './dto/login.dto';

@Controller('session')
export class SessionController {
  constructor(private authService: AuthService) {}

  @Get('login')
  async loginForm(@Req() req: NestMvcReq, @Res() res: Response) {
    if (req.session?.['isAuthenticated']) {
      return res.redirect('/admin');
    }
    const template = await req.view.render('pages/session/login');
    return res.send(template);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() body: LoginDto, @Req() req: NestMvcReq) {
    const success = await this.authService.sendMagicLink(body.email);

    if (!success) {
      throw new BadRequestException(
        '인증에 실패하였습니다. 다시 시도해주세요.',
      );
    }

    return req.view.render('pages/session/auth-success', {
      message: '매직링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.',
    });
  }

  @Get('verify')
  async verify(
    @Query('token') token: string,
    @Req() req: NestMvcReq,
    @Res() res: Response,
  ) {
    if (!token) {
      throw new ForbiddenException('유효하지 않은 접근입니다.');
    }

    const payload = await this.authService.verifyToken(token);
    if (!payload) {
      throw new ForbiddenException('링크가 만료되었거나 유효하지 않습니다.');
    }

    req.session['isAuthenticated'] = true;
    req.session['userEmail'] = payload.email;

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
