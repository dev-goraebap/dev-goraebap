import { Module } from '@nestjs/common';

import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsSharedService } from 'src/shared';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, CommentsSharedService],
})
export class CommentsModule {}
