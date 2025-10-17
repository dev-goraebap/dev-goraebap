import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, Res, UsePipes } from "@nestjs/common";
import { Response } from "express";
import { NestMvcReq } from "nestjs-mvc-tools";

import { ZodValidationPipe } from "src/common";
import { GetAdminCuratedItemsDto, GetAdminCuratedItemsSchema } from "src/infra/dto";
import { CuratedItemQueryService, CuratedSourceQueryService } from "src/infra/queries";
import { CuratedItemsCommandService } from "./curated-items-command.service";

@Controller({ path: 'admin/curation/items' })
export class AdminCuratedItemsController {

  constructor(
    private readonly curatedSourceQueryService: CuratedSourceQueryService,
    private readonly curatedItemQueryService: CuratedItemQueryService,
    private readonly curatedItemsCommand: CuratedItemsCommandService
  ) { }

  @Get()
  @UsePipes(new ZodValidationPipe(GetAdminCuratedItemsSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetAdminCuratedItemsDto) {
    const [result, sources] = await Promise.all([
      this.curatedItemQueryService.getItemsWithPagination(dto),
      this.curatedSourceQueryService.getAllSources()
    ]);

    return req.view.render('pages/admin/curation/items/index', {
      ...result,
      sources
    });
  }

  @Delete(':id')
  async destroy(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.curatedItemsCommand.destroyItem(id);
    req.flash.success('항목을 성공적으로 삭제했습니다.');
    return res.redirect(303, '/admin/curation/items');
  }

  @Post('cleanup')
  async cleanupOldItems(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Body('days', ParseIntPipe) days: number,
  ) {
    const deletedCount = await this.curatedItemsCommand.cleanupOldItems(days);
    req.flash.success(`${days}일 이전의 항목 ${deletedCount}개를 삭제했습니다.`);
    return res.redirect(303, '/admin/curation/items');
  }
}