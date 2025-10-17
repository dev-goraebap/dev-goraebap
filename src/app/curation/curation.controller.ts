import { Controller, Get, Query, Req, Res, UsePipes } from "@nestjs/common";
import { Response } from "express";
import { NestMvcReq } from "nestjs-mvc-tools";
import { IsTurboStream, ZodValidationPipe } from "src/common";
import { GetCurationFeedDto, GetCurationFeedSchema } from "src/infra/dto";
import { CuratedItemQueryService } from "src/infra/queries";

@Controller({ path: 'curation' })
export class CurationController {

  constructor(
    private readonly curatedItemQueryService: CuratedItemQueryService
  ) { }

  @Get()
  @UsePipes(new ZodValidationPipe(GetCurationFeedSchema))
  async index(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Query() dto: GetCurationFeedDto,
    @IsTurboStream() isTurboStream: boolean
  ) {
    // 더보기 버튼 클릭 시 Turbo Stream 응답
    if (isTurboStream && dto.cursor) {
      const curationData = await this.curatedItemQueryService.getItemsWithCursor(dto);

      res.setHeader('Content-Type', 'text/vnd.turbo-stream.html');
      const template = await req.view.render('pages/curation/_list_append', { curationData });
      return res.send(template);
    }

    const curationData = await this.curatedItemQueryService.getItemsWithCursor(dto);
    const template = await req.view.render('pages/curation/index', { curationData });
    return res.send(template);
  }
}