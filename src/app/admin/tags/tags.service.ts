import { BadRequestException, Injectable } from '@nestjs/common';

import { TagEntity } from 'src/shared';

import { Like } from 'typeorm';
import { CreateOrUpdateTagDto } from './dto/create-or-update-tag.dto';
import { GetTagsDto } from './dto/get-tags.dto';

@Injectable()
export class TagsService {
  async getTags(dto: GetTagsDto) {
    const where: any = {};
    if (dto.search) {
      where.name = Like(`%${dto.search}%`);
    }

    return await TagEntity.find({
      where,
      order: {
        [dto.orderKey]: dto.orderBy,
      },
    });
  }

  async getTag(id: number) {
    const tag = await TagEntity.findOne({ where: { id } });
    if (!tag) {
      throw new BadRequestException('태그를 찾을 수 없습니다.');
    }
    return tag;
  }

  async create(dto: CreateOrUpdateTagDto) {
    const newTagEntity = TagEntity.create({ ...dto });
    await newTagEntity.save();
  }

  async update(id: number, dto: CreateOrUpdateTagDto) {
    const tag = await TagEntity.findOne({
      where: { id },
    });
    if (!tag) {
      throw new BadRequestException('태그를 찾을 수 없습니다.');
    }
    const updatedTagEntity = TagEntity.create({ ...tag, ...dto });
    await updatedTagEntity.save();
  }

  async destroy(id: number) {
    const tag = await TagEntity.findOne({
      where: { id },
    });
    if (!tag) {
      throw new BadRequestException('태그를 찾을 수 없습니다.');
    }
    await tag.remove();
  }
}
