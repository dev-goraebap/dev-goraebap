import { Module } from "@nestjs/common";

import { TagApplicationService } from "./tag-application.service";
import { AdminTagController } from "./tag.controller";

@Module({
  imports: [],
  controllers: [AdminTagController],
  providers: [TagApplicationService]
})
export class AdminTagModule { }