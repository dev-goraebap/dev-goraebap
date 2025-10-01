import { Module } from "@nestjs/common";

import { BlockedIpApplicationService } from "./blocked-ip-application.service";
import { AdminBlockedIpController } from "./blocked-ip.controller";

@Module({
  imports: [],
  controllers: [AdminBlockedIpController],
  providers: [BlockedIpApplicationService]
})
export class AdminBlockedIpModule { }