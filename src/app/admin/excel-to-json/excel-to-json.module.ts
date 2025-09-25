import { Module } from "@nestjs/common";
import { AdminExcelToJsonController } from "./web/excel-to-json.controller";

@Module({
  imports: [],
  controllers: [AdminExcelToJsonController],
  providers: []
})
export class AdminExcelToJsonModule {}