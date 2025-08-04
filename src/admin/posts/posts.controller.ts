import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Req() req: NestMvcReq,
    @UploadedFile() imageFile: Express.Multer.File,
    @Body() dto: any,
    @Res() res: Response,
  ) {
    console.log(imageFile);
    console.log(dto);
    req.flash.success('게시물 저장 완료');
    return res.redirect('/admin/posts');
  }
}
