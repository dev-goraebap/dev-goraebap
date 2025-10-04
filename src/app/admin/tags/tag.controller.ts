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
  UsePipes
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { AdminAuthGuard, CurrentUser, ZodValidationPipe } from 'src/common';
import { GetAdminTagsDto, GetAdminTagsSchema } from 'src/infra/dto';
import { TagQueryService } from 'src/infra/queries';
import { SelectUser } from 'src/shared/drizzle';
import { CreateOrUpdateTagDto, CreateOrUpdateTagSchema } from './dto/create-or-update-tag.dto';
import { TagApplicationService } from './tag-application.service';

@Controller({ path: '/admin/tags' })
@UseGuards(AdminAuthGuard)
export class AdminTagController {
  constructor(
    private readonly tagQueryService: TagQueryService,
    private readonly tagCommandService: TagApplicationService
  ) { }

  @Get()
  @UsePipes(new ZodValidationPipe(GetAdminTagsSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetAdminTagsDto) {
    const tagData = await this.tagQueryService.getAdminTags(dto);
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
  async create(@Req() req: NestMvcReq, @Body('tag') dto: CreateOrUpdateTagDto, @CurrentUser() user: SelectUser) {
    await this.tagCommandService.createTag(user.id, dto);
    req.flash.success('태그를 성공적으로 추가하였습니다.');
    return req.view.render('pages/admin/tags/_success');
  }

  @Get(':id/edit')
  async edit(@Param('id', ParseIntPipe) id: number, @Req() req: NestMvcReq) {
    if (!req.headers['turbo-frame']) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }

    const tag = await this.tagQueryService.getAdminTag(id);
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
