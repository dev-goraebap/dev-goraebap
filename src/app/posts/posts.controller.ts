import { Controller, Get, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller({ path: 'posts' })
export class PostsController {
  @Get()
  index(@Req() req: NestMvcReq) {
    return req.view.render('pages/posts/index');
  }
}
