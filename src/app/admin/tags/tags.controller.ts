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
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { AdminAuthGuard, CurrentUser, ZodValidationPipe } from 'src/common';
import { UserEntity } from 'src/shared';
import { CreateOrUpdateTagDto, CreateOrUpdateTagSchema } from './dto/create-or-update-tag.dto';
import { GetTagsDto, GetTagsSchema } from './dto/get-tags.dto';
import { TagsService } from './tags.service';

@Controller({ path: '/admin/tags' })
@UseGuards(AdminAuthGuard)
export class TagsController {

  constructor(
    private readonly tagsService: TagsService
  ) {}

  @Get()
  @UsePipes(new ZodValidationPipe(GetTagsSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetTagsDto) {
    const tags = await this.tagsService.getTags(dto);

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
  async create(@Req() req: NestMvcReq, @Body('tag') dto: CreateOrUpdateTagDto, @CurrentUser() user: UserEntity) {
    await this.tagsService.create(user, dto);
    req.flash.success('태그를 성공적으로 추가하였습니다.');
    return req.view.render('pages/admin/tags/_success');
  }

  @Get(':id/edit')
  async edit(@Param('id', ParseIntPipe) id: number, @Req() req: NestMvcReq) {
    if (!req.headers['turbo-frame']) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }

    const tag = await this.tagsService.getTag(id);
    return req.view.render('pages/admin/tags/edit', {
      tag,
    });
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(CreateOrUpdateTagSchema))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: NestMvcReq,
    @Body('tag') dto: CreateOrUpdateTagDto,
  ) {
    await this.tagsService.update(id, dto);
    req.flash.success('태그를 성공적으로 변경하였습니다.');
    return req.view.render('pages/admin/tags/_success');
  }

  @Delete(':id')
  async destroy(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: NestMvcReq,
    @Res() res: Response,
  ) {
    await this.tagsService.destroy(id);
    req.flash.success('태그를 성공적으로 제거하였습니다.');
    return res.redirect(303, req.headers.referer || '/admin/tags');
  }
}
