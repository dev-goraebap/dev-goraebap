import { Controller, Get, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller({ path: 'series' })
export class SeriesController {
  @Get()
  index(@Req() req: NestMvcReq) {
    return req.view.render('pages/series/index');
  }
}
