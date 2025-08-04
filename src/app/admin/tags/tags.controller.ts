import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { ZodValidationPipe } from 'src/common';
import { CreateOrUpdateTagDto, CreateOrUpdateTagSchema } from './dto/create-or-update-tag.dto';
import { GetTagsDto, GetTagsSchema } from './dto/get-tags.dto';

@Controller({ path: '/admin/tags' })
export class TagsController {
  @Get()
  @UsePipes(new ZodValidationPipe(GetTagsSchema))
  index(@Req() req: NestMvcReq, @Query() dto: GetTagsDto) {
    console.log(dto);

    const tags = [
      {
        name: 'nestjs',
        description: '',
        relatedPostCount: 6,
        createdAt: new Date(),
      },
      {
        name: 'angular',
        description: '',
        relatedPostCount: 3,
        createdAt: new Date(),
      },
      {
        name: 'js',
        description: '',
        relatedPostCount: 10,
        createdAt: new Date(),
      },
      {
        name: 'nodejs',
        description: '',
        relatedPostCount: 23,
        createdAt: new Date(),
      },
      {
        name: 'ruby on rails',
        description: '',
        relatedPostCount: 6,
        createdAt: new Date(),
      },
    ];

    if (req.headers['turbo-frame']) {
      return req.view.render('pages/admin/tags/_list', { tags });
    }
    return req.view.render('pages/admin/tags/index', { tags });
  }

  @Get('new')
  new(@Req() req: NestMvcReq) {
    if (!req.headers['turbo-frame']) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }
    return req.view.render('pages/admin/tags/new');
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateOrUpdateTagSchema))
  create(@Req() req: NestMvcReq, @Body('tag') dto: CreateOrUpdateTagDto) {
    console.log(dto);
    req.flash.success('태그를 성공적으로 추가하였습니다.');
    return req.view.render('pages/admin/tags/_success');
  }

  @Get(':id/edit')
  edit(@Param('id', ParseIntPipe) id: number, @Req() req: NestMvcReq) {
    if (!req.headers['turbo-frame']) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }
    
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
  @UsePipes(new ZodValidationPipe(CreateOrUpdateTagSchema))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: NestMvcReq,
    @Body('tag') dto: CreateOrUpdateTagDto,
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
