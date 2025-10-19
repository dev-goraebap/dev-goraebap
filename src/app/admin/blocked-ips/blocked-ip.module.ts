import { Module } from "@nestjs/common";

import { BlockedIpCommandService } from "./blocked-ip-command.service";
import { AdminBlockedIpController } from "./blocked-ip.controller";

@Module({
  imports: [],
  controllers: [AdminBlockedIpController],
  providers: [BlockedIpCommandService]
})
export class AdminBlockedIpModule { }