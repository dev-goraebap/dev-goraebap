import {
  BadRequestException,
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
  UseGuards,
  UsePipes
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { AdminAuthGuard, ZodValidationPipe } from 'src/common';
import { CuratedSourceQueryService } from 'src/infra/queries';
import { CuratedSourcesCommandService } from './curated-sources-command.service';
import { CreateSourceDto, CreateSourceSchema, UpdateSourceDto, UpdateSourceSchema } from './dto/create-or-update-source.dto';

@Controller({ path: 'admin/curation/sources' })
@UseGuards(AdminAuthGuard)
export class AdminCuratedSourcesController {
  constructor(
    private readonly curatedSourcesCommand: CuratedSourcesCommandService,
    private readonly curationQuery: CuratedSourceQueryService,
  ) { }

  // ---------------------------------------------------------------------------
  // 소스 관리
  // ---------------------------------------------------------------------------

  @Get()
  async index(@Req() req: NestMvcReq) {
    const sources = await this.curationQuery.getAllSourcesWithCount();
    const stats = await this.curationQuery.getStats();

    return req.view.render('pages/admin/curation/sources/index', {
      sources,
      stats,
    });
  }

  @Get('new')
  new(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/curation/sources/new');
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateSourceSchema))
  async create(@Req() req: NestMvcReq, @Body() dto: CreateSourceDto) {
    try {
      await this.curatedSourcesCommand.createSource(dto);
      req.flash.success('RSS 소스를 성공적으로 추가했습니다.');
      return req.view.render('pages/admin/curation/sources/_redirect');
    } catch (err) {
      if (err instanceof BadRequestException) {
        req.flash.error(err.message);
      }
      return req.view.render('pages/admin/curation/sources/_redirect');
    }
  }

  @Get(':id/edit')
  async edit(
    @Req() req: NestMvcReq,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const source = await this.curationQuery.getSourceById(id);
    return req.view.render('pages/admin/curation/sources/edit', { source });
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(UpdateSourceSchema))
  async update(@Req() req: NestMvcReq, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSourceDto) {
    try {
      await this.curatedSourcesCommand.updateSource(id, dto);
      req.flash.success('RSS 소스를 성공적으로 수정했습니다.');
      return req.view.render('pages/admin/curation/sources/_redirect');
    } catch (err) {
      if (err instanceof BadRequestException) {
        req.flash.error(err.message);
      }
      return req.view.render('pages/admin/curation/sources/_redirect');
    }
  }

  @Put(':id/toggle')
  async toggle(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.curatedSourcesCommand.toggleSourceActive(id);
    req.flash.success('RSS 소스 활성화 상태를 변경했습니다.');
    return res.redirect(303, '/admin/curation/sources');
  }

  @Delete(':id')
  async destroy(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.curatedSourcesCommand.deleteSource(id);
    req.flash.success('RSS 소스를 성공적으로 삭제했습니다.');
    return res.redirect(303, '/admin/curation/sources');
  }

  // ---------------------------------------------------------------------------
  // RSS 취합
  // ---------------------------------------------------------------------------

  @Post(':id/fetch')
  async fetchFromSource(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const newCount = await this.curatedSourcesCommand.fetchFromSource(id);
    req.flash.success(`RSS 피드를 가져왔습니다. (신규 항목: ${newCount}개)`);
    return res.redirect(303, '/admin/curation/sources');
  }

  @Post('fetch-all')
  async fetchAll(
    @Req() req: NestMvcReq,
    @Res() res: Response,
  ) {
    const result = await this.curatedSourcesCommand.fetchAllActiveSources();
    req.flash.success(`모든 활성 소스에서 RSS 피드를 가져왔습니다. (신규 항목: ${result.total}개)`);
    return res.redirect(303, '/admin/curation/sources');
  }
}
