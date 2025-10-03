import { eq, inArray } from "drizzle-orm";

import { DrizzleContext, SelectTag, tags } from "src/shared/drizzle";
import { UserID } from "../user";

export type TagID = number;

export type CreateTagParam = {
  readonly userId: UserID;
  readonly name: string;
  readonly description: string;
}

export type UpdateTagParam = {
  readonly name?: string;
  readonly description?: string;
}

export class TagEntity implements SelectTag {
  constructor(
    readonly id: TagID,
    readonly userId: UserID,
    readonly name: string,
    readonly description: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) { }

  static create(param: CreateTagParam): TagEntity {
    return new TagEntity(
      0, // id: 0 means new entity
      param.userId,
      param.name,
      param.description,
      new Date(),
      new Date(),
    );
  }

  static fromRaw(data: SelectTag): TagEntity {
    return new TagEntity(
      data.id,
      data.userId,
      data.name,
      data.description,
      data.createdAt,
      data.updatedAt
    );
  }

  isNew(): boolean {
    return this.id === 0;
  }

  static async findById(id: TagID): Promise<TagEntity | null> {
    const result = await DrizzleContext.db().query.tags.findFirst({
      where: eq(tags.id, id)
    });
    return result ? TagEntity.fromRaw(result) : null;
  }

  static async findByName(name: string): Promise<TagEntity | null> {
    const result = await DrizzleContext.db().query.tags.findFirst({
      where: eq(tags.name, name)
    });
    return result ? TagEntity.fromRaw(result) : null;
  }

  static async findByNames(names: string[]): Promise<TagEntity[]> {
    const rawTags = await DrizzleContext.db()
      .select()
      .from(tags)
      .where(inArray(tags.name, names));
    return rawTags.map(x => TagEntity.fromRaw(x));
  }

  async save(): Promise<TagEntity> {
    if (this.isNew()) {
      // INSERT
      const [raw] = await DrizzleContext.db()
        .insert(tags)
        .values({
          userId: this.userId,
          name: this.name,
          description: this.description,
        })
        .returning();
      return TagEntity.fromRaw(raw);
    } else {
      // UPDATE
      const [raw] = await DrizzleContext.db()
        .update(tags)
        .set({
          name: this.name,
          description: this.description,
        })
        .where(eq(tags.id, this.id))
        .returning();
      return TagEntity.fromRaw(raw);
    }
  }

  static async saveAll(tagEntities: TagEntity[]): Promise<TagEntity[]> {
    const newTags = tagEntities.filter(t => t.isNew());
    const existingTags = tagEntities.filter(t => !t.isNew());

    const results: TagEntity[] = [];

    // Bulk insert for new tags
    if (newTags.length > 0) {
      const rawTags = await DrizzleContext.db()
        .insert(tags)
        .values(newTags.map(t => ({
          userId: t.userId,
          name: t.name,
          description: t.description,
        })))
        .returning();
      results.push(...rawTags.map(x => TagEntity.fromRaw(x)));
    }

    // Individual update for existing tags
    for (const tag of existingTags) {
      const updated = await tag.save();
      results.push(updated);
    }

    return results;
  }

  static async delete(id: TagID): Promise<{ id: TagID }> {
    const [result] = await DrizzleContext.db()
      .delete(tags)
      .where(eq(tags.id, id))
      .returning({ id: tags.id });
    return result;
  }

  /**
   * 태그 찾기 or 생성 (없으면 자동 생성)
   */
  static async findOrCreate(userId: UserID, tagNames: string[]): Promise<TagEntity[]> {
    // 1. 기존 태그 조회
    const existingTags = await this.findByNames(tagNames);
    const existingNames = existingTags.map(t => t.name);

    // 2. 없는 태그 이름 찾기
    const newTagNames = tagNames.filter(name => !existingNames.includes(name));

    // 3. 새 태그 생성
    if (newTagNames.length === 0) {
      return existingTags;
    }

    const newTags = newTagNames.map(name =>
      TagEntity.create({
        userId,
        name,
        description: ''
      })
    );
    const savedTags = await TagEntity.saveAll(newTags);

    // 4. 기존 + 새로생성 합쳐서 반환
    return [...existingTags, ...savedTags];
  }
}