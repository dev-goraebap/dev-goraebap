import { and, eq, ne } from "drizzle-orm";
import { SeriesEntity, SeriesID, SeriesRepository } from "src/domain/series";
import { DrizzleContext, series } from "src/shared/drizzle";

export class SeriesRepositoryImpl implements SeriesRepository {
  async findById(id: SeriesID): Promise<SeriesEntity | null> {
    const result = await DrizzleContext.db().query.series.findFirst({
      where: eq(series.id, id)
    });
    return result ? SeriesEntity.fromRaw(result) : null;
  }

  async findByName(name: string): Promise<SeriesEntity | null> {
    const result = await DrizzleContext.db().query.series.findFirst({
      where: eq(series.name, name)
    });
    return result ? SeriesEntity.fromRaw(result) : null;
  }

  async checkNameExists(name: string, excludeId?: SeriesID): Promise<boolean> {
    const whereCondition = excludeId
      ? and(eq(series.name, name), ne(series.id, excludeId))
      : eq(series.name, name);

    const result = await DrizzleContext.db().query.series.findFirst({
      where: whereCondition
    });

    return !!result;
  }

  async save(seriesEntity: SeriesEntity): Promise<SeriesEntity> {
    if (seriesEntity.isNew()) {
      // INSERT
      const [raw] = await DrizzleContext.db()
        .insert(series)
        .values({
          userId: seriesEntity.userId,
          name: seriesEntity.name,
          slug: seriesEntity.slug,
          description: seriesEntity.description,
          status: seriesEntity.status,
          isPublishedYn: seriesEntity.isPublishedYn,
          publishedAt: seriesEntity.publishedAt,
        })
        .returning();
      return SeriesEntity.fromRaw(raw);
    } else {
      // UPDATE
      const [raw] = await DrizzleContext.db()
        .update(series)
        .set({
          name: seriesEntity.name,
          slug: seriesEntity.slug,
          description: seriesEntity.description,
          status: seriesEntity.status,
          isPublishedYn: seriesEntity.isPublishedYn,
          publishedAt: seriesEntity.publishedAt,
          updatedAt: seriesEntity.updatedAt,
        })
        .where(eq(series.id, seriesEntity.id))
        .returning();
      return SeriesEntity.fromRaw(raw);
    }
  }

  async delete(id: SeriesID): Promise<void> {
    await DrizzleContext.db()
      .delete(series)
      .where(eq(series.id, id));
  }
}
