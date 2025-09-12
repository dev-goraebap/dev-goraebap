import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BlockedIpEntity } from 'src/core/infrastructure/entities';
import { GetBlockedIpsDto } from '../dto/get-blocked-ips.dto';

@Injectable()
export class BlockedIpQueryService {
  constructor(
    @InjectRepository(BlockedIpEntity)
    private readonly ipBlockedRepository: Repository<BlockedIpEntity>,
  ) {}

  async getBlockedIpList(dto: GetBlockedIpsDto) {
    const qb = this.ipBlockedRepository.createQueryBuilder('blockedIp');

    if (dto.search) {
      qb.where('(CAST(blockedIp.ipAddress AS TEXT) LIKE :searchName OR blockedIp.reason LIKE :searchName)', {
        searchName: `%${dto.search}%`,
      });
    }

    qb.orderBy(`blockedIp.${dto.orderKey}`, dto.orderBy);

    // 페이지네이션 추가
    const offset = (dto.page - 1) * dto.perPage;
    qb.skip(offset).take(dto.perPage);

    // 결과 반환 (총 개수와 함께)
    const [blockedIpList, total] = await qb.getManyAndCount();

    return {
      blockedIpList,
      pagination: {
        page: dto.page,
        perPage: dto.perPage,
        total,
        totalPages: Math.ceil(total / dto.perPage),
      },
    };
  }
}