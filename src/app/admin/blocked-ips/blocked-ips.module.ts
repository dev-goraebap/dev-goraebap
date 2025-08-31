import { Module } from '@nestjs/common';

import { BlockedIpsController } from './blocked-ips.controller';
import { BlockedIpsService } from './blocked-ips.service';

@Module({
  controllers: [BlockedIpsController],
  providers: [BlockedIpsService],
})
export class BlockedIpsModule {}
