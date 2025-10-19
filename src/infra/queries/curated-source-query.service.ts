import { Injectable } from '@nestjs/common';
import { count, desc, eq } from 'drizzle-orm';

import { curatedItems, curatedSources, DrizzleContext, SelectCuratedSource } from 'src/shared/drizzle';
import { CuratedSourceWithCount } from '../read-models';

@Injectable()
export class CuratedSourceQueryService {
  /**
   * 모든 소스 조회 (항목 개수 포함)
   */
  async getAllSourcesWithCount(): Promise<CuratedSourceWithCount[]> {
    const sources = await DrizzleContext.db()
      .select({
        id: curatedSources.id,
        name: curatedSources.name,
        url: curatedSources.url,
        isActiveYn: curatedSources.isActiveYn,
        createdAt: curatedSources.createdAt,
        updatedAt: curatedSources.updatedAt,
      })
      .from(curatedSources)
      .orderBy(desc(curatedSources.createdAt));

    // 각 소스별 항목 개수 조회
    const sourcesWithCount: CuratedSourceWithCount[] = [];
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
   * 모든 소스 조회 (페이징 처리 없음)
   */
  async getAllSources(): Promise<SelectCuratedSource[]> {
    return await DrizzleContext.db()
      .select()
      .from(curatedSources);
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
