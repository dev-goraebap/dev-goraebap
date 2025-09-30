import { Module } from "@nestjs/common";

import { TagDataGateway } from "./tag.data-gateway";
import { TagTableModule } from "./tag.table-module";

@Module({
  providers: [TagTableModule, TagDataGateway],
  exports: [TagTableModule]
})
export class TagModule { }