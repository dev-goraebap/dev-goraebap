import { Module } from '@nestjs/common';

import { BlockedIpCommandService } from './application/orchestrators/blocked-ip-command.service';
import { BlockedIpQueryService } from './application/orchestrators/blocked-ip-query.service';

@Module({
  providers: [
    BlockedIpCommandService,
    BlockedIpQueryService,
  ],
  exports: [
    BlockedIpCommandService,
    BlockedIpQueryService,
  ],
})
export class BlockedIpModule {}