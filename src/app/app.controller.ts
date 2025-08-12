import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller()
export class AppController {

  @Get()
  async getHello(@Req() req: NestMvcReq, @Res() res: Response) {
    // 쿠키의 visited 값이 true일 경우 (이전에 방문한 적이 있는경우)
    // 게시물 조회 페이지로 이동 시키기
    const visited = false;
    if (visited) {
      return res.redirect('/posts');
    }
    const template = await req.view.render('pages/landing/index');
    return res.send(template);
  }
}
