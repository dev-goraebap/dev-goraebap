import { Module } from '@nestjs/common';

import { BlockedIpCommandService } from './orchestrators/blocked-ip-command.service';
import { BlockedIpQueryService } from './orchestrators/blocked-ip-query.service';

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