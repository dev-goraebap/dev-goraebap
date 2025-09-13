import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { GetAdminCommentsDto } from "../dto";
import { CommentEntity } from "../entities";

@Injectable()
export class CommentRepository {

  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>
  ) { }

  // ---------------------------------------------------------------------------
  // 관리자 조회
  // ---------------------------------------------------------------------------

  async findAdminComments(dto: GetAdminCommentsDto) {
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