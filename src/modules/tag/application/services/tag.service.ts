import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TagEntity, UserEntity } from 'src/shared';
import { CreateOrUpdateTagDto } from '../dto/create-or-update-tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  async findById(id: number): Promise<TagEntity | null> {
    return this.tagRepository.findOne({ where: { id } });
  }

  async createTag(user: UserEntity, dto: CreateOrUpdateTagDto): Promise<TagEntity> {
    const newTagEntity = this.tagRepository.create({ user, ...dto });
    return await this.tagRepository.save(newTagEntity);
  }

  async updateTag(tag: TagEntity, dto: CreateOrUpdateTagDto): Promise<TagEntity> {
    const updatedTagEntity = this.tagRepository.create({ ...tag, ...dto });
    return await this.tagRepository.save(updatedTagEntity);
  }

  async destroyTag(tag: TagEntity): Promise<void> {
    await this.tagRepository.remove(tag);
  }
}