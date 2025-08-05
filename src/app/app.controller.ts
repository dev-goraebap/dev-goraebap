import { Controller, Get, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller()
export class AppController {

  @Get()
  getHello(@Req() req: NestMvcReq) {
    return req.view.render('pages/hello_world/index');
  }
}
