import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async index(@Req() req: NestMvcReq, @Res() res: Response) {
    // 쿠키의 visited 값이 true일 경우 (이전에 방문한 적이 있는경우)
    // 게시물 조회 페이지로 이동 시키기
    const visited = false;
    if (visited) {
      return res.redirect('/posts');
    }

    // 실제 데이터 가져오기
    const series = await this.appService.getSeries();
    const posts = await this.appService.getPosts();

    const template = await req.view.render('pages/landing/index', {
      series,
      posts
    });
    return res.send(template);
  }

  @Get('about')
  async about() {}
}
