import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { ITagRepository, TagEntity } from 'src/app/tag/domain';
import { DRIZZLE, DrizzleOrm } from 'src/shared/drizzle';
import { tags } from 'src/shared/drizzle/schema';
import { TransactionContext } from 'src/shared/drizzle/transaction-context';
import { TagDataMapper } from '../mappers/tag.mapper';

@Injectable()
export class TagRepository implements ITagRepository {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleOrm,
    private txContext: TransactionContext
  ) {}

  async findByName(name: string): Promise<TagEntity | null> {
    const executor = this.txContext.getCurrentTransaction() || this.db;

    const result = await executor
      .select()
      .from(tags)
      .where(eq(tags.name, name))
      .limit(1);

    if (result.length === 0) return null;

    return TagDataMapper.toEntity(result[0]);
  }

  async save(tag: TagEntity): Promise<TagEntity> {
    const executor = this.txContext.getCurrentTransaction() || this.db;

    if (tag.id) {
      // Update existing tag
      const updateData = TagDataMapper.toUpdateData(tag);
      const result = await executor
        .update(tags)
        .set(updateData)
        .where(eq(tags.id, tag.id))
        .returning();

      return TagDataMapper.toEntity(result[0]);
    } else {
      // Insert new tag
      const insertData = TagDataMapper.toInsertData(tag);
      const result = await executor
        .insert(tags)
        .values(insertData)
        .returning();

      return TagDataMapper.toEntity(result[0]);
    }
  }

  async saveMany(tags: TagEntity[]): Promise<TagEntity[]> {
    const savedTags: TagEntity[] = [];

    for (const tag of tags) {
      const savedTag = await this.save(tag);
      savedTags.push(savedTag);
    }

    return savedTags;
  }
}