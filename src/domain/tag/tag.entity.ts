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
  private constructor(
    readonly id: TagID,
    readonly userId: UserID,
    readonly name: string,
    readonly description: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) { }

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

  static async create(param: CreateTagParam): Promise<TagEntity> {
    const [raw] = await DrizzleContext.db()
      .insert(tags)
      .values(param)
      .returning();
    return TagEntity.fromRaw(raw);
  }

  static async creates(values: CreateTagParam[]): Promise<TagEntity[]> {
    const rawTags = await DrizzleContext.db()
      .insert(tags)
      .values(values)
      .returning();
    return rawTags.map(x => TagEntity.fromRaw(x));
  }

  static async update(id: TagID, param: UpdateTagParam): Promise<TagEntity> {
    const [raw] = await DrizzleContext.db()
      .update(tags)
      .set(param)
      .where(eq(tags.id, id))
      .returning();
    return TagEntity.fromRaw(raw);
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

    const createTagParams = newTagNames.map(name => ({
      userId,
      name,
      description: ''
    } as CreateTagParam));
    const newTags = await this.creates(createTagParams);

    // 4. 기존 + 새로생성 합쳐서 반환
    return [...existingTags, ...newTags];
  }
}