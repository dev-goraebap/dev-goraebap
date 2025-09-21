import { Inject, Injectable } from '@nestjs/common';
import { asc, count, desc, like, or, sql } from 'drizzle-orm';

import { GetBlockedIpsDto } from 'src/core/infrastructure/dto';
import { blockedIps, DRIZZLE, DrizzleOrm } from 'src/shared/drizzle';

@Injectable()
export class BlockedIpQueryService {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm
  ) { }

  // ---------------------------------------------------------------------------
  // 관리자 조회
  // ---------------------------------------------------------------------------

  async getAdminBlockedIpList(dto: GetBlockedIpsDto) {
    // 검색 조건 설정
    const whereCondition = dto.search
      ? or(
          sql`CAST(${blockedIps.ipAddress} AS TEXT) LIKE ${`%${dto.search}%`}`,
          like(blockedIps.reason, `%${dto.search}%`)
        )
      : undefined;

    // 정렬 설정
    const orderCondition = dto.orderBy === 'ASC'
      ? asc(blockedIps[dto.orderKey])
      : desc(blockedIps[dto.orderKey]);

    // 페이지네이션 계산
    const offset = (dto.page - 1) * dto.perPage;

    // 메인 쿼리 (데이터)
    const blockedIpQuery = this.drizzle
      .select()
      .from(blockedIps)
      .where(whereCondition)
      .orderBy(orderCondition)
      .limit(dto.perPage)
      .offset(offset);

    // 총 개수 쿼리
    const countQuery = this.drizzle
      .select({ count: count() })
      .from(blockedIps)
      .where(whereCondition);

    // 병렬 실행
    const [blockedIpResults, totalResults] = await Promise.all([
      blockedIpQuery,
      countQuery
    ]);

    const total = totalResults[0].count;

    return {
      blockedIpList: blockedIpResults,
      pagination: {
        page: dto.page,
        perPage: dto.perPage,
        total,
        totalPages: Math.ceil(total / dto.perPage),
      },
    };
  }
}