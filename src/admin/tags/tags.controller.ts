import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { ZodValidationPipe } from 'src/common';
import { CreateTagDto, CreateTagSchema } from './dto/create-tag.dto';
import { Response } from 'express';

@Controller({ path: '/admin/tags' })
export class TagsController {
  @Get()
  index(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/tags/index');
  }

  @Get('new')
  new(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/tags/new');
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateTagSchema))
  create(@Req() req: NestMvcReq, @Body('tag') dto: CreateTagDto) {
    console.log(dto);
    req.flash.success('태그를 성공적으로 추가하였습니다.');
    return req.view.render('pages/admin/tags/_success');
  }

  @Get(':id/edit')
  edit(@Param('id', ParseIntPipe) id: number, @Req() req: NestMvcReq) {
    const tag = {
      id: 1,
      name: 'test-tag',
      description: 'hello world',
    };
    return req.view.render('pages/admin/tags/edit', {
      tag,
    });
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(CreateTagSchema))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: NestMvcReq,
    @Body('tag') dto: CreateTagDto,
  ) {
    console.log(dto);
    req.flash.success('태그를 성공적으로 변경하였습니다.');
    return req.view.render('pages/admin/tags/_success');
  }

  @Delete(':id')
  destroy(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: NestMvcReq,
    @Res() res: Response,
  ) {
    req.flash.success('태그를 성공적으로 제거하였습니다.');
    return res.redirect(303, req.headers.referer || '/admin/tags');
  }
}
