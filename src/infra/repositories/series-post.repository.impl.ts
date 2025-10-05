import { and, eq, inArray } from "drizzle-orm";
import { SeriesPostEntity, SeriesPostID, SeriesPostRepository } from "src/domain/series-post";
import { DrizzleContext, seriesPosts } from "src/shared/drizzle";

export class SeriesPostRepositoryImpl implements SeriesPostRepository {
  async findById(id: SeriesPostID): Promise<SeriesPostEntity | null> {
    const result = await DrizzleContext.db().query.seriesPosts.findFirst({
      where: eq(seriesPosts.id, id)
    });
    return result ? SeriesPostEntity.fromRaw(result) : null;
  }

  async findByIds(ids: SeriesPostID[]): Promise<SeriesPostEntity[]> {
    if (ids.length === 0) return [];

    const results = await DrizzleContext.db().query.seriesPosts.findMany({
      where: inArray(seriesPosts.id, ids)
    });
    return results.map(raw => SeriesPostEntity.fromRaw(raw));
  }

  async find(seriesId: number, postId: number): Promise<SeriesPostEntity | null> {
    const result = await DrizzleContext.db().query.seriesPosts.findFirst({
      where: and(
        eq(seriesPosts.seriesId, seriesId),
        eq(seriesPosts.postId, postId)
      )
    });
    return result ? SeriesPostEntity.fromRaw(result) : null;
  }

  async save(seriesPost: SeriesPostEntity): Promise<SeriesPostEntity> {
    if (seriesPost.isNew()) {
      // INSERT
      const [raw] = await DrizzleContext.db()
        .insert(seriesPosts)
        .values(seriesPost.toInsertData())
        .returning();
      return SeriesPostEntity.fromRaw(raw);
    } else {
      // UPDATE
      const [raw] = await DrizzleContext.db()
        .update(seriesPosts)
        .set(seriesPost.toUpdateData())
        .where(eq(seriesPosts.id, seriesPost.id))
        .returning();
      return SeriesPostEntity.fromRaw(raw);
    }
  }

  async saveMany(seriesPostEntities: SeriesPostEntity[]): Promise<void> {
    await DrizzleContext.transaction(async () => {
      for (const entity of seriesPostEntities) {
        await DrizzleContext.db()
          .update(seriesPosts)
          .set(entity.toUpdateData())
          .where(eq(seriesPosts.id, entity.id));
      }
    });
  }

  async delete(id: SeriesPostID): Promise<void> {
    await DrizzleContext.db()
      .delete(seriesPosts)
      .where(eq(seriesPosts.id, id));
  }
}
