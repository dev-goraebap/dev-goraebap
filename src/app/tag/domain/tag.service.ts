import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import { UserID } from "src/app/user";
import { CreateTagParam, TagEntity } from "./tag.entity";
import { ITagRepository, TAG_REPO } from "./tag.repository";

@Injectable()
export class TagService {

  constructor(
    @Inject(TAG_REPO)
    private readonly tagRepository: ITagRepository
  ) { }

  async create(param: CreateTagParam): Promise<TagEntity> {
    const existsTag = await this.tagRepository.findByName(param.name);
    if (existsTag) {
      throw new BadRequestException('이미 사용중인 태그입니다.');
    }
    const tag = TagEntity.create(param);
    return await this.tagRepository.save(tag);
  }

  async creates(userId: UserID, tagNames: string[]): Promise<TagEntity[]> {
    const existingAndNewTags: TagEntity[] = [];

    for (const tagName of tagNames) {
      const existingTag = await this.tagRepository.findByName(tagName);

      if (existingTag) {
        existingAndNewTags.push(existingTag);
      } else {
        const newTag = TagEntity.create({
          userId,
          name: tagName,
          description: ''
        });
        existingAndNewTags.push(newTag);
      }
    }

    return await this.tagRepository.saveMany(existingAndNewTags);
  }
}