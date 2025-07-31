import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req: NestMvcReq) {
    return req.view.render('pages/hello_world/index');
  }
}
