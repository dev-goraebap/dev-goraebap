import { Inject, Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';

import { DRIZZLE, DrizzleOrm, tags } from 'src/shared/drizzle';

@Injectable()
export class TagSharedService {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
  ) { }

  async findOrCreateTags(tagNames: string[], tx: PgTransaction<any>) {
    // 기존 태그 조회
    const existingTags = await tx
      .select()
      .from(tags)
      .where(inArray(tags.name, tagNames));

    const existingTagNames = existingTags.map((tag) => tag.name);
    const newTagNames = tagNames.filter((name) => !existingTagNames.includes(name));

    // 새 태그 생성
    let newTags: any[] = [];
    if (newTagNames.length > 0) {
      const tagsToCreate = newTagNames.map((name) => ({
        name,
        description: ''
      }));
      newTags = await tx.insert(tags)
        .values(tagsToCreate)
        .returning();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return [...existingTags, ...newTags];
  }
}
