import { Injectable } from '@nestjs/common';

import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentService } from '../services/comment.service';

@Injectable()
export class CommentCreationService {
  constructor(
    private readonly commentService: CommentService,
  ) {}

  async create(requestId: string, postSlug: string, dto: CreateCommentDto) {
    // 1. 게시물 조회 및 검증
    const post = await this.commentService.findPostBySlug(postSlug);
    
    // 2. 댓글 생성
    return await this.commentService.createComment(requestId, post, dto);
  }
}