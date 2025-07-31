import { Controller, Get, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller({ path: '/admin/posts' })
export class PostsController {
  @Get()
  index(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/posts/index');
  }
}
