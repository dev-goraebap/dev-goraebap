import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller({ path: '/admin/posts' })
export class PostsController {
  @Get()
  index(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/posts/index');
  }

  @Get('new')
  new(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/posts/new');
  }

  @Post()
  create(
    @Req() req: NestMvcReq,
    @Body() dto: any,
    @Res() res: Response,
  ) {
    console.log(dto);
    req.flash.success('게시물 저장 완료');
    return res.redirect('/admin/posts');
  }
}
