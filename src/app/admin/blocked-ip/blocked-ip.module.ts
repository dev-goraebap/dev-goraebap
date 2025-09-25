import { Module } from "@nestjs/common";

import { BlockedIpCommandService } from "./services/blocked-ip-command.service";
import { BlockedIpQueryService } from "./services/blocked-ip-query.service";
import { AdminBlockedIpController } from "./web/blocked-ip.controller";

@Module({
  imports: [],
  controllers: [AdminBlockedIpController],
  providers: [BlockedIpCommandService, BlockedIpQueryService]
})
export class AdminBlockedIpModule { }