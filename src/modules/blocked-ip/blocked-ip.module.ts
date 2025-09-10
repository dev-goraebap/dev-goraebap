import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlockedIpEntity } from 'src/shared';
import { BlockedIpService } from './application/services/blocked-ip.service';
import { BlockedIpQueryService } from './application/services/blocked-ip-query.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlockedIpEntity])],
  providers: [
    // Level 1: 순수 도메인 서비스
    BlockedIpService,
    BlockedIpQueryService,
  ],
  exports: [
    BlockedIpService,
    BlockedIpQueryService,
  ],
})
export class BlockedIpModule {}