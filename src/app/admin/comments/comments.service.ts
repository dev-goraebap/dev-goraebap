import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from 'src/shared';
import { Repository } from 'typeorm';
import { GetCommentsDto } from './dto/get-comments.dto';

@Injectable()
export class CommentsService {
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

  async banComment(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });
    if (!comment) {
      throw new BadRequestException('댓글을 찾을 수 없습니다.');
    }
    await this.commentRepository.softRemove(comment);
  }
}
