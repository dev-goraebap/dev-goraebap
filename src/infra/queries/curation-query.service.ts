import { Injectable } from '@nestjs/common';
import { and, count, desc, eq, sql } from 'drizzle-orm';

import { curatedItems, curatedSources, DrizzleContext } from 'src/shared/drizzle';

export type CurationSourceWithCount = {
  id: number;
  name: string;
  url: string;
  isActiveYn: 'Y' | 'N';
  fetchIntervalMinutes: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CurationItemDetail = {
  id: number;
  title: string;
  link: string;
  guid: string;
  snippet: string | null;
  pubDate: Date;
  source: string;
  sourceId: number | null;
  createdAt: Date;
};

@Injectable()
export class CurationQueryService {
  /**
   * 모든 소스 조회 (항목 개수 포함)
   */
  async getAllSourcesWithCount(): Promise<CurationSourceWithCount[]> {
    const sources = await DrizzleContext.db()
      .select({
        id: curatedSources.id,
        name: curatedSources.name,
        url: curatedSources.url,
        isActiveYn: curatedSources.isActiveYn,
        fetchIntervalMinutes: curatedSources.fetchIntervalMinutes,
        createdAt: curatedSources.createdAt,
        updatedAt: curatedSources.updatedAt,
      })
      .from(curatedSources)
      .orderBy(desc(curatedSources.createdAt));

    // 각 소스별 항목 개수 조회
    const sourcesWithCount: CurationSourceWithCount[] = [];
    for (const source of sources) {
      const [countResult] = await DrizzleContext.db()
        .select({ count: count() })
        .from(curatedItems)
        .where(eq(curatedItems.sourceId, source.id));

      sourcesWithCount.push({
        ...source,
        itemCount: countResult.count,
      });
    }

    return sourcesWithCount;
  }

  /**
   * 소스 ID로 조회
   */
  async getSourceById(id: number) {
    return await DrizzleContext.db().query.curatedSources.findFirst({
      where: eq(curatedSources.id, id),
    });
  }

  /**
   * 항목 목록 조회 (페이징)
   */
  async getItems(params: {
    page?: number;
    perPage?: number;
    sourceId?: number;
  }): Promise<{ items: CurationItemDetail[]; total: number; page: number; perPage: number }> {
    const page = params.page || 1;
    const perPage = params.perPage || 50;
    const offset = (page - 1) * perPage;

    const whereCondition = params.sourceId
      ? eq(curatedItems.sourceId, params.sourceId)
      : undefined;

    // 항목 조회
    const items = await DrizzleContext.db()
      .select()
      .from(curatedItems)
      .where(whereCondition)
      .orderBy(desc(curatedItems.pubDate))
      .limit(perPage)
      .offset(offset);

    // 전체 개수
    const [totalResult] = await DrizzleContext.db()
      .select({ count: count() })
      .from(curatedItems)
      .where(whereCondition);

    return {
      items,
      total: totalResult.count,
      page,
      perPage,
    };
  }

  /**
   * 항목 ID로 조회
   */
  async getItemById(id: number) {
    return await DrizzleContext.db().query.curatedItems.findFirst({
      where: eq(curatedItems.id, id),
    });
  }

  /**
   * 전체 통계
   */
  async getStats(): Promise<{
    totalSources: number;
    activeSources: number;
    totalItems: number;
  }> {
    const [sourcesCount] = await DrizzleContext.db()
      .select({ count: count() })
      .from(curatedSources);

    const [activeSourcesCount] = await DrizzleContext.db()
      .select({ count: count() })
      .from(curatedSources)
      .where(eq(curatedSources.isActiveYn, 'Y'));

    const [itemsCount] = await DrizzleContext.db()
      .select({ count: count() })
      .from(curatedItems);

    return {
      totalSources: sourcesCount.count,
      activeSources: activeSourcesCount.count,
      totalItems: itemsCount.count,
    };
  }
}
