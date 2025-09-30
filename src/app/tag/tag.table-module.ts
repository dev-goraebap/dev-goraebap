import { Injectable } from "@nestjs/common";

import { UserID } from "../user";
import { TagDataGateway } from "./tag.data-gateway";
import { CreateTagParam, TagEntity } from "./tag.entity";

@Injectable()
export class TagTableModule {

  constructor(
    private readonly dataGateway: TagDataGateway
  ) { }

  async findOrCreate(userId: UserID, tagNames: string[]): Promise<TagEntity[]> {
    // 1. 기존 태그 조회
    const existingTags = await this.dataGateway.findByNames(tagNames);
    const existingNames = existingTags.map(t => t.name);

    // 2. 없는 태그 이름 찾기
    const newTagNames = tagNames.filter(name => !existingNames.includes(name));

    // 3. 새 태그 생성
    const createTagParams = newTagNames.map(name => ({ userId, name, description: '' } as CreateTagParam))
    const newTags = await this.dataGateway.insertMany(createTagParams);

    // 4. 기존 + 새로생성 합쳐서 반환
    return [...existingTags, ...newTags];
  }
}