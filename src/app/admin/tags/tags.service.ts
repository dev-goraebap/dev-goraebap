import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { TagEntity, UserEntity } from 'src/shared';
import { CreateOrUpdateTagDto } from './dto/create-or-update-tag.dto';
import { GetTagsDto } from './dto/get-tags.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  async getTags(dto: GetTagsDto) {
    const where: any = {};
    if (dto.search) {
      where.name = Like(`%${dto.search}%`);
    }

    return await this.tagRepository.find({
      where,
      order: {
        [dto.orderKey]: dto.orderBy,
      },
    });
  }

  async getTag(id: number) {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new BadRequestException('태그를 찾을 수 없습니다.');
    }
    return tag;
  }

  async create(user: UserEntity, dto: CreateOrUpdateTagDto) {
    const newTagEntity = this.tagRepository.create({ user, ...dto });
    await this.tagRepository.save(newTagEntity);
  }

  async update(id: number, dto: CreateOrUpdateTagDto) {
    const tag = await this.tagRepository.findOne({
      where: { id },
    });
    if (!tag) {
      throw new BadRequestException('태그를 찾을 수 없습니다.');
    }
    const updatedTagEntity = this.tagRepository.create({ ...tag, ...dto });
    await this.tagRepository.save(updatedTagEntity);
  }

  async destroy(id: number) {
    const tag = await this.tagRepository.findOne({
      where: { id },
    });
    if (!tag) {
      throw new BadRequestException('태그를 찾을 수 없습니다.');
    }
    await this.tagRepository.remove(tag);
  }
}
