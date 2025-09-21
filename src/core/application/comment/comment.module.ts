import { Module } from '@nestjs/common';

import { CommentCommandService } from './orchestrators/comment-command.service';
import { CommentQueryService } from './orchestrators/comment-query.service';

const services = [
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