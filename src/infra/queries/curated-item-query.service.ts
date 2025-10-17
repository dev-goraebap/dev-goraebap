import { Injectable } from "@nestjs/common";
import { asc, count, desc, eq } from "drizzle-orm";
import { curatedItems, DrizzleContext, SelectCuratedItem } from "src/shared/drizzle";
import { GetAdminCuratedItemsDto } from "../dto";
import { PaginationModel } from "../read-models";
import { CuratedItemReadModel } from "../read-models/curated-item-read.model";

@Injectable()
export class CuratedItemQueryService {
  /**
   * 항목 목록 조회 (페이징)
   */
  async getItems(dto: GetAdminCuratedItemsDto): Promise<PaginationModel<Partial<CuratedItemReadModel>>> {
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
    const raws = await DrizzleContext.db()
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

    const items = raws.map(x => this.getCuratedItemReadModel(x));
    return PaginationModel.with(items, {
      page: page,
      perPage: perPage,
      total: totalResult.count
    });
  }

  private getCuratedItemReadModel(x: Partial<SelectCuratedItem>): Partial<CuratedItemReadModel> {
    return CuratedItemReadModel.from(x);
  }
}