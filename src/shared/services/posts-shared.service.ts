import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsSharedService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async updateViewCount(slug: string) {
    const result = await this.postRepository.increment({ slug }, 'viewCount', 1);
    if (result.affected === 0) {
      throw new BadRequestException('조회수 업데이트에 실패하였습니다.');
    }
  }
}
