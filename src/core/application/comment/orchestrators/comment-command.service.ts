import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentService } from '../services/comment.service';

@Injectable()
export class CommentCommandService {
  constructor(
    private readonly commentService: CommentService,
  ) { }

  async create(requestId: string, postSlug: string, dto: CreateCommentDto) {
    // 1. 게시물 조회 및 검증
    const post = await this.commentService.findPostBySlug(postSlug);

    // 2. 댓글 생성
    return await this.commentService.createComment(requestId, post, dto);
  }

  async banComment(id: number) {
    // 1. 댓글 조회 및 검증
    const comment = await this.commentService.findById(id);
    if (!comment) {
      throw new BadRequestException('댓글을 찾을 수 없습니다.');
    }

    // 2. 댓글 차단 (소프트 삭제)
    await this.commentService.banComment(comment);
  }
}