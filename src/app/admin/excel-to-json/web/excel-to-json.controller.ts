import { Controller, Get, Req } from "@nestjs/common";
import { NestMvcReq } from "nestjs-mvc-tools";

@Controller({ path: 'admin/excel-to-json' })
export class AdminExcelToJsonController {
  @Get()
  index(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/excel-to-json/index');
  }
}