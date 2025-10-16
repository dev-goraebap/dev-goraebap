import { desc, eq, lt, sql } from "drizzle-orm";

import { curatedItems, DrizzleContext, SelectCuratedItem } from "src/shared/drizzle";
import { CurationSourceID } from "./curation-source.entity";

export type CurationItemID = number;

export type CreateCurationItemParam = {
  readonly title: string;
  readonly link: string;
  readonly guid: string;
  readonly snippet: string | null;
  readonly pubDate: Date;
  readonly source: string;
  readonly sourceId: CurationSourceID | null;
}

export class CurationItemEntity implements SelectCuratedItem {
  private constructor(
    readonly id: CurationItemID,
    readonly title: string,
    readonly link: string,
    readonly guid: string,
    readonly snippet: string | null,
    readonly pubDate: Date,
    readonly source: string,
    readonly sourceId: CurationSourceID | null,
    readonly createdAt: Date,
  ) { }

  static create(param: CreateCurationItemParam): CurationItemEntity {
    return new CurationItemEntity(
      0, // id: 0 means new entity
      param.title,
      param.link,
      param.guid,
      param.snippet,
      param.pubDate,
      param.source,
      param.sourceId,
      new Date(),
    );
  }

  static fromRaw(data: SelectCuratedItem): CurationItemEntity {
    return new CurationItemEntity(
      data.id,
      data.title,
      data.link,
      data.guid,
      data.snippet,
      data.pubDate,
      data.source,
      data.sourceId,
      data.createdAt,
    );
  }

  isNew(): boolean {
    return this.id === 0;
  }

  static async findById(id: CurationItemID): Promise<CurationItemEntity | null> {
    const result = await DrizzleContext.db().query.curatedItems.findFirst({
      where: eq(curatedItems.id, id)
    });
    return result ? CurationItemEntity.fromRaw(result) : null;
  }

  static async findByGuid(guid: string): Promise<CurationItemEntity | null> {
    const result = await DrizzleContext.db().query.curatedItems.findFirst({
      where: eq(curatedItems.guid, guid)
    });
    return result ? CurationItemEntity.fromRaw(result) : null;
  }

  static async findByLink(link: string): Promise<CurationItemEntity | null> {
    const result = await DrizzleContext.db().query.curatedItems.findFirst({
      where: eq(curatedItems.link, link)
    });
    return result ? CurationItemEntity.fromRaw(result) : null;
  }

  static async findBySourceId(sourceId: CurationSourceID, limit: number = 50): Promise<CurationItemEntity[]> {
    const results = await DrizzleContext.db()
      .select()
      .from(curatedItems)
      .where(eq(curatedItems.sourceId, sourceId))
      .orderBy(desc(curatedItems.pubDate))
      .limit(limit);
    return results.map(x => CurationItemEntity.fromRaw(x));
  }

  async save(): Promise<CurationItemEntity> {
    if (this.isNew()) {
      // INSERT
      const [raw] = await DrizzleContext.db()
        .insert(curatedItems)
        .values({
          title: this.title,
          link: this.link,
          guid: this.guid,
          snippet: this.snippet,
          pubDate: this.pubDate,
          source: this.source,
          sourceId: this.sourceId,
        })
        .returning();
      return CurationItemEntity.fromRaw(raw);
    } else {
      // UPDATE는 현재 필요없음 (항목은 수정하지 않음)
      throw new Error('CurationItemEntity does not support update');
    }
  }

  static async deleteById(id: CurationItemID): Promise<void> {
    await DrizzleContext.db()
      .delete(curatedItems)
      .where(eq(curatedItems.id, id));
  }

  static async deleteBySourceId(sourceId: CurationSourceID): Promise<void> {
    await DrizzleContext.db()
      .delete(curatedItems)
      .where(eq(curatedItems.sourceId, sourceId));
  }

  /**
   * N일 이전의 항목 삭제
   * @param days 일수
   * @returns 삭제된 개수
   */
  static async deleteOldItems(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await DrizzleContext.db()
      .delete(curatedItems)
      .where(lt(curatedItems.pubDate, cutoffDate))
      .returning({ id: curatedItems.id });

    return result.length;
  }

  /**
   * 전체 항목 개수
   */
  static async count(): Promise<number> {
    const [result] = await DrizzleContext.db()
      .select({ count: sql<number>`count(*)` })
      .from(curatedItems);
    return Number(result.count);
  }

  /**
   * 소스별 항목 개수
   */
  static async countBySourceId(sourceId: CurationSourceID): Promise<number> {
    const [result] = await DrizzleContext.db()
      .select({ count: sql<number>`count(*)` })
      .from(curatedItems)
      .where(eq(curatedItems.sourceId, sourceId));
    return Number(result.count);
  }
}
