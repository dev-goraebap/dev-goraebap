import { eq } from "drizzle-orm";

import { curatedSources, DrizzleContext, SelectCuratedSource } from "src/shared/drizzle";
import { YN } from "../_concern";

export type CurationSourceID = number;

export type CreateCurationSourceParam = {
  readonly name: string;
  readonly url: string;
  readonly isActiveYn: YN;
}

export type UpdateCurationSourceParam = {
  readonly name?: string;
  readonly url?: string;
  readonly isActiveYn?: YN;
}

export class CurationSourceEntity implements SelectCuratedSource {
  readonly id!: CurationSourceID;
  readonly name!: string;
  readonly url!: string;
  readonly isActiveYn!: 'Y' | 'N';
  readonly createdAt!: Date;
  readonly updatedAt!: Date;

  static create(param: CreateCurationSourceParam): CurationSourceEntity {
    return Object.assign(new CurationSourceEntity(), {
      id: 0, // id: 0 means new entity
      name: param.name,
      url: param.url,
      isActiveYn: param.isActiveYn,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Partial<CurationSourceEntity>);
  }

  static fromRaw(data: SelectCuratedSource): CurationSourceEntity {
    return Object.assign(new CurationSourceEntity(), {
      id: data.id,
      name: data.name,
      url: data.url,
      isActiveYn: data.isActiveYn,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } satisfies Partial<CurationSourceEntity>);
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

  static async findByUrl(url: string) {
    const result = await DrizzleContext.db().query.curatedSources.findFirst({
      where: eq(curatedSources.url, url)
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
    return Object.assign(new CurationSourceEntity(), {
      id: this.id,
      name: param.name ?? this.name,
      url: param.url ?? this.url,
      isActiveYn: param.isActiveYn ?? this.isActiveYn,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    } satisfies Partial<CurationSourceEntity>);
  }

  toggle(): CurationSourceEntity {
    return Object.assign(new CurationSourceEntity(), {
      id: this.id,
      name: this.name,
      url: this.url,
      isActiveYn: this.isActiveYn === 'Y' ? 'N' : 'Y',
      createdAt: this.createdAt,
      updatedAt: new Date(),
    } satisfies Partial<CurationSourceEntity>);
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
