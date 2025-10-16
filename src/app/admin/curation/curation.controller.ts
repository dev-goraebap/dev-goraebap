import {
  Body,
  Controller,
  Delete,
  Get,
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

import { AdminAuthGuard, ZodValidationPipe } from 'src/common';
import { CurationQueryService } from 'src/infra/queries/curation-query.service';
import { CurationApplicationService } from './curation-application.service';
import { CreateSourceDto, CreateSourceSchema, UpdateSourceDto, UpdateSourceSchema } from './dto/create-or-update-source.dto';

@Controller({ path: '/admin/curation' })
@UseGuards(AdminAuthGuard)
export class AdminCurationController {
  constructor(
    private readonly curationApplicationService: CurationApplicationService,
    private readonly curationQueryService: CurationQueryService,
  ) { }

  // ---------------------------------------------------------------------------
  // 소스 관리
  // ---------------------------------------------------------------------------

  @Get('sources')
  async sourcesIndex(@Req() req: NestMvcReq) {
    const sources = await this.curationQueryService.getAllSourcesWithCount();
    const stats = await this.curationQueryService.getStats();

    return req.view.render('pages/admin/curation/sources/index', {
      sources,
      stats,
    });
  }

  @Get('sources/new')
  new(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/curation/sources/new');
  }

  @Post('sources')
  @UsePipes(new ZodValidationPipe(CreateSourceSchema))
  async createSource(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Body('source') dto: CreateSourceDto,
  ) {
    await this.curationApplicationService.createSource(dto);
    req.flash.success('RSS 소스를 성공적으로 추가했습니다.');
    return res.redirect('/admin/curation/sources');
  }

  @Get('sources/:id/edit')
  async editSource(
    @Req() req: NestMvcReq,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const source = await this.curationQueryService.getSourceById(id);
    return req.view.render('pages/admin/curation/sources/edit', { source });
  }

  @Put('sources/:id')
  @UsePipes(new ZodValidationPipe(UpdateSourceSchema))
  async updateSource(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body('source') dto: UpdateSourceDto,
  ) {
    await this.curationApplicationService.updateSource(id, dto);
    req.flash.success('RSS 소스를 성공적으로 수정했습니다.');
    return res.redirect(303, '/admin/curation/sources');
  }

  @Put('sources/:id/toggle')
  async toggleSource(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.curationApplicationService.toggleSourceActive(id);
    req.flash.success('RSS 소스 활성화 상태를 변경했습니다.');
    return res.redirect(303, '/admin/curation/sources');
  }

  @Delete('sources/:id')
  async deleteSource(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.curationApplicationService.deleteSource(id);
    req.flash.success('RSS 소스를 성공적으로 삭제했습니다.');
    return res.redirect(303, '/admin/curation/sources');
  }

  // ---------------------------------------------------------------------------
  // RSS 취합
  // ---------------------------------------------------------------------------

  @Post('sources/:id/fetch')
  async fetchFromSource(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const newCount = await this.curationApplicationService.fetchFromSource(id);
    req.flash.success(`RSS 피드를 가져왔습니다. (신규 항목: ${newCount}개)`);
    return res.redirect(303, '/admin/curation/sources');
  }

  @Post('fetch-all')
  async fetchAll(
    @Req() req: NestMvcReq,
    @Res() res: Response,
  ) {
    const result = await this.curationApplicationService.fetchAllActiveSources();
    req.flash.success(`모든 활성 소스에서 RSS 피드를 가져왔습니다. (신규 항목: ${result.total}개)`);
    return res.redirect(303, '/admin/curation/sources');
  }

  // ---------------------------------------------------------------------------
  // 항목 관리
  // ---------------------------------------------------------------------------

  @Get('items')
  async itemsIndex(
    @Req() req: NestMvcReq,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('sourceId', new ParseIntPipe({ optional: true })) sourceId?: number,
  ) {
    const result = await this.curationQueryService.getItems({
      page: page || 1,
      perPage: 50,
      sourceId,
    });

    const sources = await this.curationQueryService.getAllSourcesWithCount();

    return req.view.render('pages/admin/curation/items/index', {
      ...result,
      sources,
      currentSourceId: sourceId,
    });
  }

  @Delete('items/:id')
  async deleteItem(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.curationApplicationService.deleteItem(id);
    req.flash.success('항목을 성공적으로 삭제했습니다.');
    return res.redirect(303, '/admin/curation/items');
  }

  @Post('items/cleanup')
  async cleanupOldItems(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Body('days', ParseIntPipe) days: number,
  ) {
    const deletedCount = await this.curationApplicationService.deleteOldItems(days);
    req.flash.success(`${days}일 이전의 항목 ${deletedCount}개를 삭제했습니다.`);
    return res.redirect(303, '/admin/curation/items');
  }
}
