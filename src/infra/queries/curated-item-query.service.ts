import { Injectable } from "@nestjs/common";
import { and, asc, count, desc, eq, lt, or, SQL } from "drizzle-orm";

import { curatedItems, DrizzleContext, SelectCuratedItem } from "src/shared/drizzle";
import { GetAdminCuratedItemsDto, GetCurationFeedDto } from "../dto";
import { CursorPaginationModel, PaginationModel, withCursor } from "../read-models";

@Injectable()
export class CuratedItemQueryService {
  /**
   * 항목 목록 조회 (페이징)
   */
  async getItemsWithPagination(dto: GetAdminCuratedItemsDto): Promise<PaginationModel<Partial<SelectCuratedItem>>> {
    console.log(dto);
    const page = dto.page;
    const perPage = dto.perPage;
    const offset = (page - 1) * perPage;

    // 조건 설정
    const whereCondition = dto.sourceId
      ? eq(curatedItems.sourceId, dto.sourceId)
      : undefined;

    // 정렬 설정
    const orderCondition = dto.orderBy === 'ASC'
      ? asc(curatedItems[dto.orderKey])
      : desc(curatedItems[dto.orderKey]);

    // 항목 조회
    const raws: SelectCuratedItem[] = await DrizzleContext.db()
      .select()
      .from(curatedItems)
      .where(whereCondition)
      .orderBy(orderCondition)
      .limit(perPage)
      .offset(offset);

    // 전체 개수
    const [totalResult] = await DrizzleContext.db()
      .select({ count: count() })
      .from(curatedItems)
      .where(whereCondition);

    return PaginationModel.with(raws, {
      page: page,
      perPage: perPage,
      total: totalResult.count
    });
  }

  async getItemsWithCursor(dto: GetCurationFeedDto): Promise<CursorPaginationModel<SelectCuratedItem>> {
    // 조건 처리
    let whereCondition: SQL | undefined = undefined;
    if (dto.sourceId) {
      whereCondition = eq(curatedItems.sourceId, dto.sourceId);
    }
    if (dto.cursor) {
      whereCondition = and(
        whereCondition,
        or(
          lt(curatedItems.pubDate, dto.cursor.pubDate),
          and(
            eq(curatedItems.pubDate, dto.cursor.pubDate),
            lt(curatedItems.id, dto.cursor.id)
          )
        )
      );
    }

    const raws: SelectCuratedItem[] = await DrizzleContext.db()
      .select()
      .from(curatedItems)
      .where(whereCondition)
      .limit(dto.perPage + 1)
      .orderBy(desc(curatedItems.pubDate), desc(curatedItems.id));

    return withCursor(raws, dto.perPage, (last) => {
      return {
        id: last.id,
        pubDate: last.pubDate,
      }
    });
  }
}