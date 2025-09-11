import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
    const qb = this.tagRepository.createQueryBuilder('tag');
    qb.leftJoinAndSelect('tag.posts', 'post');

    if (dto.search) {
      qb.where('tag.name LIKE :searchName', {
        searchName: `%${dto.search}%`,
      });
    }

    qb.orderBy(`tag.${dto.orderKey}`, dto.orderBy);

    // 페이지네이션 추가
    const offset = (dto.page - 1) * dto.perPage;
    qb.skip(offset).take(dto.perPage);

    // 결과 반환 (총 개수와 함께)
    const [tags, total] = await qb.getManyAndCount();

    return {
      tags,
      pagination: {
        page: dto.page,
        perPage: dto.perPage,
        total,
        totalPages: Math.ceil(total / dto.perPage),
      },
    };
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
