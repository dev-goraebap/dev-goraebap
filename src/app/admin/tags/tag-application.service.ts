import { BadRequestException, Injectable } from "@nestjs/common";

import { TagEntity } from "src/domain/tag/tag.entity";
import { SelectTag, UserId } from "src/shared/drizzle";
import { LoggerService } from "src/shared/logger";
import { CreateOrUpdateTagDto } from "./dto/create-or-update-tag.dto";

@Injectable()
export class TagApplicationService {

  constructor(
    private readonly logger: LoggerService
  ) { }

  async createTag(userId: UserId, dto: CreateOrUpdateTagDto): Promise<SelectTag> {
    const existsTag = await TagEntity.findByName(dto.name);
    if (existsTag) {
      throw new BadRequestException('이미 사용중인 태그명 입니다.');
    }

    try {
      const tag = TagEntity.create({
        userId,
        name: dto.name,
        description: dto.description ?? ''
      });
      return await tag.save();
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  async updateTag(id: number, dto: CreateOrUpdateTagDto): Promise<SelectTag> {
    const tag = await TagEntity.findById(id);
    if (!tag) {
      throw new BadRequestException('태그가 존재하지 않습니다.');
    }

    try {
      const updatedTag = new TagEntity(
        tag.id,
        tag.userId,
        dto.name,
        dto.description ?? tag.description,
        tag.createdAt,
        new Date(),
      );
      return await updatedTag.save();
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  async destroyTag(id: number): Promise<{ id: number }> {
    const tag = await TagEntity.findById(id);
    if (!tag) {
      throw new BadRequestException('태그가 존재하지 않습니다.');
    }

    try {
      return await TagEntity.delete(id);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }
}