import { Module } from '@nestjs/common';

import { CommentCommandService } from './orchestrators/comment-command.service';
import { CommentQueryService } from './orchestrators/comment-query.service';
import { CommentService } from './services/comment.service';

const services = [
  CommentService,
  CommentQueryService,
  CommentCommandService
];

@Module({
  providers: [
    ...services
  ],
  exports: [
    ...services
  ],
})
export class CommentModule { }