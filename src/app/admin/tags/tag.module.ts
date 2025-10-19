import { Module } from "@nestjs/common";

import { TagCommandService } from "./tag-command.service";
import { AdminTagController } from "./tag.controller";

@Module({
  imports: [],
  controllers: [AdminTagController],
  providers: [TagCommandService]
})
export class AdminTagModule { }