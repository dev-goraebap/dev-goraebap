import { Controller, Get, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller({ path: 'admin' })
export class AdminController {
  @Get()
  index(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/index');
  }
}
