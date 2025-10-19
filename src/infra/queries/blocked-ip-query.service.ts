import { Injectable } from '@nestjs/common';
import { asc, count, desc, like, or, sql } from 'drizzle-orm';

import { blockedIps, DrizzleContext, SelectBlockedIp } from 'src/shared/drizzle';
import { GetBlockedIpsDto } from '../dto';
import { PaginationModel } from '../read-models';

@Injectable()
export class BlockedIpQueryService {

  async getAdminBlockedIpsWithPagination(dto: GetBlockedIpsDto): Promise<PaginationModel<SelectBlockedIp>> {
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
    const blockedIpQuery = DrizzleContext.db()
      .select()
      .from(blockedIps)
      .where(whereCondition)
      .orderBy(orderCondition)
      .limit(dto.perPage)
      .offset(offset);

    // 총 개수 쿼리
    const countQuery = DrizzleContext.db()
      .select({ count: count() })
      .from(blockedIps)
      .where(whereCondition);

    // 병렬 실행
    const [raws, totalRaws] = await Promise.all([
      blockedIpQuery,
      countQuery
    ]);
    const total = totalRaws[0].count;

    return PaginationModel.with(raws, {
      page: dto.page,
      perPage: dto.perPage,
      total: total
    });
  }
}