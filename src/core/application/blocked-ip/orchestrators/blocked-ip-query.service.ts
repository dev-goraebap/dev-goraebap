import { Injectable } from '@nestjs/common';

import { GetBlockedIpsDto } from 'src/core/infrastructure/dto';
import { BlockedIpRepository } from 'src/core/infrastructure/repositories';

@Injectable()
export class BlockedIpQueryService {
  constructor(
    private readonly blockedIpRepository: BlockedIpRepository,
  ) { }

  // ---------------------------------------------------------------------------
  // 관리자 조회
  // ---------------------------------------------------------------------------

  async getAdminBlockedIpList(dto: GetBlockedIpsDto) {
    return await this.blockedIpRepository.findAdminBlockedIpList(dto);
  }
}