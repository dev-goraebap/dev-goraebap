import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TagEntity, UserEntity } from "src/shared";
import { CreateOrUpdateTagDto } from "../dto/create-or-update-tag.dto";

@Injectable()
export class TagCommandService {

  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) { }

  async createTag(user: UserEntity, dto: CreateOrUpdateTagDto): Promise<TagEntity> {
    const newTagEntity = this.tagRepository.create({ user, ...dto });
    return await this.tagRepository.save(newTagEntity);
  }

  async updateTag(id: number, dto: CreateOrUpdateTagDto): Promise<TagEntity> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new BadRequestException('태그가 존재하지 않습니다.');
    }
    const updatedTagEntity = this.tagRepository.create({ ...tag, ...dto });
    return await this.tagRepository.save(updatedTagEntity);
  }

  async destroyTag(id: number): Promise<void> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new BadRequestException('태그가 존재하지 않습니다.');
    }
    await this.tagRepository.remove(tag);
  }
}