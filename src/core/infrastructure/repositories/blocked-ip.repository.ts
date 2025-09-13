import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GetBlockedIpsDto } from "../dto";
import { BlockedIpEntity } from "../entities";

@Injectable()
export class BlockedIpRepository {

  constructor(
    @InjectRepository(BlockedIpEntity)
    private readonly blockedIpRepository: Repository<BlockedIpEntity>
  ) { }

  // ---------------------------------------------------------------------------
  // 관리자 조회
  // ---------------------------------------------------------------------------

  async findAdminBlockedIpList(dto: GetBlockedIpsDto) {
    const qb = this.blockedIpRepository.createQueryBuilder('blockedIp');

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