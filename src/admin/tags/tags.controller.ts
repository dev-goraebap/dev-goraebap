import { Controller, Get, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller({ path: '/admin/tags' })
export class TagsController {
  @Get()
  index(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/tags/index');
  }
}
