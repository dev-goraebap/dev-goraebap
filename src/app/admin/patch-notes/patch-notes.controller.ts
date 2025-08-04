import { Controller, Get, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller({ path: '/admin/patch-notes' })
export class PatchNotesController {
  @Get()
  index(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/patch-notes/index');
  }
}
