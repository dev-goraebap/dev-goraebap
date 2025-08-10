import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { AdminAuthGuard } from 'src/common';

@Controller({ path: 'admin' })
@UseGuards(AdminAuthGuard)
export class AdminController {
  @Get()
  index(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/index');
  }
}
