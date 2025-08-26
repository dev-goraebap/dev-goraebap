import { Injectable } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';

import { TagEntity } from '../entities';

@Injectable()
export class TagsSharedService {
  constructor() {}

  async findOrCreateTags(tagNames: string[], manager: EntityManager): Promise<TagEntity[]> {
    const tagRepo = manager.getRepository(TagEntity);

    // 기존 태그 조회
    const existingTags = await tagRepo.find({
      where: { name: In(tagNames) },
    });

    const existingTagNames = existingTags.map((tag) => tag.name);
    const newTagNames = tagNames.filter((name) => !existingTagNames.includes(name));

    // 새 태그 생성
    let newTags: TagEntity[] = [];
    if (newTagNames.length > 0) {
      const tagsToCreate = newTagNames.map((name) => tagRepo.create({ name, description: '' }));
      newTags = await tagRepo.save(tagsToCreate);
    }

    return [...existingTags, ...newTags];
  }
}
