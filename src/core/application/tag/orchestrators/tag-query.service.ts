import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GetAdminTagsDto } from 'src/core/infrastructure/dto';
import { TagEntity } from 'src/core/infrastructure/entities';
import { TagRepository } from 'src/core/infrastructure/repositories';

@Injectable()
export class TagQueryService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    private readonly customTagRepository: TagRepository
  ) { }

  // ---------------------------------------------------------------------------
  // 일반 조회
  // ---------------------------------------------------------------------------

  async getFeedTags() {
    return await this.tagRepository.find({
      relations: {
        posts: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 관리자 조회
  // ---------------------------------------------------------------------------

  async getAdminTags(dto: GetAdminTagsDto) {
    return this.customTagRepository.findAdminTags(dto);
  }

  async getAdminTag(id: number) {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new BadRequestException('태그를 찾을 수 없습니다.');
    }
    return tag;
  }
}