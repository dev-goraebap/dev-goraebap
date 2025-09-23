import { Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';

import { DrizzleTransaction, SelectTag, tags } from 'src/shared/drizzle';

@Injectable()
export class TagSharedService {

  async findOrCreateTags(tagNames: string[], tx: DrizzleTransaction): Promise<SelectTag[]> {
    // 기존 태그 조회
    const existingTags = await tx
      .select()
      .from(tags)
      .where(inArray(tags.name, tagNames));

    const existingTagNames = existingTags.map((tag) => tag.name);
    const newTagNames = tagNames.filter((name) => !existingTagNames.includes(name));

    // 새 태그 생성
    let newTags: SelectTag[] = [];
    if (newTagNames.length > 0) {
      const tagsToCreate = newTagNames.map((name) => ({
        name,
        description: ''
      }));
      newTags = await tx.insert(tags)
        .values(tagsToCreate)
        .returning();
    }
    return [...existingTags, ...newTags];
  }
}
