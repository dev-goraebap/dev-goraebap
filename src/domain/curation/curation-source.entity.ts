import { eq } from "drizzle-orm";
import { curatedSources, DrizzleContext, SelectCuratedSource } from "src/shared/drizzle";
import { YN } from "../_concern";

export type CurationSourceID = number;

export type CreateCurationSourceParam = {
  readonly name: string;
  readonly url: string;
  readonly fetchIntervalMinutes: number;
  readonly isActiveYn: YN;
}

export type UpdateCurationSourceParam = {
  readonly name?: string;
  readonly url?: string;
  readonly fetchIntervalMinutes?: number;
  readonly isActiveYn?: YN;
}

export class CurationSourceEntity implements SelectCuratedSource {
  private constructor(
    readonly id: CurationSourceID,
    readonly name: string,
    readonly url: string,
    readonly isActiveYn: 'Y' | 'N',
    readonly fetchIntervalMinutes: number,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) { }

  static create(param: CreateCurationSourceParam): CurationSourceEntity {
    return new CurationSourceEntity(
      0, // id: 0 means new entity
      param.name,
      param.url,
      param.isActiveYn,
      param.fetchIntervalMinutes,
      new Date(),
      new Date(),
    );
  }

  static fromRaw(data: SelectCuratedSource): CurationSourceEntity {
    return new CurationSourceEntity(
      data.id,
      data.name,
      data.url,
      data.isActiveYn,
      data.fetchIntervalMinutes,
      data.createdAt,
      data.updatedAt,
    );
  }

  isNew(): boolean {
    return this.id === 0;
  }

  static async findById(id: CurationSourceID): Promise<CurationSourceEntity | null> {
    const result = await DrizzleContext.db().query.curatedSources.findFirst({
      where: eq(curatedSources.id, id)
    });
    return result ? CurationSourceEntity.fromRaw(result) : null;
  }

  static async findAll(): Promise<CurationSourceEntity[]> {
    const results = await DrizzleContext.db()
      .select()
      .from(curatedSources)
      .orderBy(curatedSources.createdAt);
    return results.map(x => CurationSourceEntity.fromRaw(x));
  }

  static async findAllActive(): Promise<CurationSourceEntity[]> {
    const results = await DrizzleContext.db()
      .select()
      .from(curatedSources)
      .where(eq(curatedSources.isActiveYn, 'Y'))
      .orderBy(curatedSources.createdAt);
    return results.map(x => CurationSourceEntity.fromRaw(x));
  }

  update(param: UpdateCurationSourceParam): CurationSourceEntity {
    return new CurationSourceEntity(
      this.id,
      param.name ?? this.name,
      param.url ?? this.url,
      param.isActiveYn ?? this.isActiveYn,
      param.fetchIntervalMinutes ?? this.fetchIntervalMinutes,
      this.createdAt,
      new Date(),
    );
  }

  toggle(): CurationSourceEntity {
    return new CurationSourceEntity(
      this.id,
      this.name,
      this.url,
      this.isActiveYn === 'Y' ? 'N' : 'Y',
      this.fetchIntervalMinutes,
      this.createdAt,
      new Date(),
    );
  }

  async save(): Promise<CurationSourceEntity> {
    if (this.isNew()) {
      // INSERT
      const [raw] = await DrizzleContext.db()
        .insert(curatedSources)
        .values({
          name: this.name,
          url: this.url,
          isActiveYn: this.isActiveYn,
          fetchIntervalMinutes: this.fetchIntervalMinutes,
        })
        .returning();
      return CurationSourceEntity.fromRaw(raw);
    } else {
      // UPDATE
      const [raw] = await DrizzleContext.db()
        .update(curatedSources)
        .set({
          name: this.name,
          url: this.url,
          isActiveYn: this.isActiveYn,
          fetchIntervalMinutes: this.fetchIntervalMinutes,
          updatedAt: this.updatedAt,
        })
        .where(eq(curatedSources.id, this.id))
        .returning();
      return CurationSourceEntity.fromRaw(raw);
    }
  }

  static async delete(id: CurationSourceID): Promise<void> {
    await DrizzleContext.db()
      .delete(curatedSources)
      .where(eq(curatedSources.id, id));
  }
}
