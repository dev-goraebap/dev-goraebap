import { Injectable } from '@nestjs/common';

import { CommentsSharedService } from 'src/shared';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsApplicationService {
  constructor(
    private readonly commentsSharedService: CommentsSharedService,
    private readonly commentsService: CommentsService,
  ) {}

  getComments(postSlug: string) {
    return this.commentsSharedService.getComments(postSlug);
  }

  create(requestId: string, postSlug: string, dto: CreateCommentDto) {
    return this.commentsService.create(requestId, postSlug, dto);
  }
}
