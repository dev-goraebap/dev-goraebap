import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommentEntity } from 'src/shared';
import { GetCommentsDto } from '../dto/get-comments.dto';

@Injectable()
export class CommentQueryService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async getComments(dto: GetCommentsDto) {
    const qb = this.commentRepository.createQueryBuilder('comment');
    qb.leftJoinAndSelect('comment.post', 'post');

    // 검색 조건 추가
    if (dto.search) {
      qb.where('(comment.comment LIKE :search OR comment.nickname LIKE :search)', {
        search: `%${dto.search}%`,
      });
    }

    // 정렬 추가
    qb.orderBy(`comment.${dto.orderKey}`, dto.orderBy);

    // 페이지네이션 추가
    const offset = (dto.page - 1) * dto.perPage;
    qb.skip(offset).take(dto.perPage);

    // 결과 반환 (총 개수와 함께)
    const [comments, total] = await qb.getManyAndCount();

    return {
      comments,
      pagination: {
        page: dto.page,
        perPage: dto.perPage,
        total,
        totalPages: Math.ceil(total / dto.perPage),
      },
    };
  }
}