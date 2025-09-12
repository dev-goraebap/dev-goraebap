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

import { CreateOrUpdateTagDto, CreateOrUpdateTagSchema, GetTagsDto, GetTagsSchema, TagCommandService, TagQueryService } from 'src/core/application/tag';
import { CurrentUser } from 'src/core/presentation/decorators';
import { AdminAuthGuard } from 'src/core/presentation/guards';
import { ZodValidationPipe } from 'src/core/presentation/pipes';
import { UserEntity } from 'src/core/infrastructure/entities';

@Controller({ path: '/admin/tags' })
@UseGuards(AdminAuthGuard)
export class AdminTagController {
  constructor(
    private readonly tagQueryService: TagQueryService,
    private readonly tagCommandService: TagCommandService
  ) { }

  @Get()
  @UsePipes(new ZodValidationPipe(GetTagsSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetTagsDto) {
    const tagData = await this.tagQueryService.getTags(dto);
    return req.view.render('pages/admin/tags/index', { ...tagData });
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
    await this.tagCommandService.createTag(user, dto);
    req.flash.success('태그를 성공적으로 추가하였습니다.');
    return req.view.render('pages/admin/tags/_success');
  }

  @Get(':id/edit')
  async edit(@Param('id', ParseIntPipe) id: number, @Req() req: NestMvcReq) {
    if (!req.headers['turbo-frame']) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }

    const tag = await this.tagQueryService.getTag(id);
    return req.view.render('pages/admin/tags/edit', { tag });
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(CreateOrUpdateTagSchema))
  async update(@Param('id', ParseIntPipe) id: number, @Req() req: NestMvcReq, @Body('tag') dto: CreateOrUpdateTagDto) {
    await this.tagCommandService.updateTag(id, dto);
    req.flash.success('태그를 성공적으로 변경하였습니다.');
    return req.view.render('pages/admin/tags/_success');
  }

  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number, @Req() req: NestMvcReq, @Res() res: Response) {
    await this.tagCommandService.destroyTag(id);
    req.flash.success('태그를 성공적으로 제거하였습니다.');
    return res.redirect(303, req.headers.referer || '/admin/tags');
  }
}
