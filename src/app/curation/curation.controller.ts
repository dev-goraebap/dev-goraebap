import { Controller, Get, Query, Req, Res, UsePipes } from "@nestjs/common";
import { Response } from "express";
import { NestMvcReq } from "nestjs-mvc-tools";

import { IsTurboStream, ZodValidationPipe } from "src/common";
import { GetCurationFeedDto, GetCurationFeedSchema } from "src/infra/dto";
import { CuratedItemQueryService, CuratedSourceQueryService } from "src/infra/queries";

@Controller({ path: 'curation' })
export class CurationController {

  constructor(
    private readonly curatedItemQueryService: CuratedItemQueryService,
    private readonly curatedSourceQueryService: CuratedSourceQueryService
  ) { }

  @Get()
  @UsePipes(new ZodValidationPipe(GetCurationFeedSchema))
  async index(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Query() dto: GetCurationFeedDto,
    @IsTurboStream() isTurboStream: boolean
  ) {
    const [curationData, sources] = await Promise.all([
      this.curatedItemQueryService.getItemsWithCursor(dto),
      this.curatedSourceQueryService.getAllSources()
    ]);

    // 더보기 버튼 클릭 시 Turbo Stream 응답
    if (isTurboStream && dto.cursor) {
      res.setHeader('Content-Type', 'text/vnd.turbo-stream.html');
      const template = await req.view.render('pages/curation/_list_append', { curationData, sources });
      return res.send(template);
    }
    const template = await req.view.render('pages/curation/index', { curationData, sources });
    return res.send(template);
  }
}