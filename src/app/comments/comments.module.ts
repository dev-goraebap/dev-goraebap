import { Module } from '@nestjs/common';

import { CommentsApplicationService } from './comments-application.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, CommentsApplicationService],
})
export class CommentsModule {}
