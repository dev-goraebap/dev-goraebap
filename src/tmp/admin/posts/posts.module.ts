import { Module } from '@nestjs/common';

import { PostsApplicationService } from './posts-application.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController],
  providers: [PostsApplicationService, PostsService],
})
export class PostsModule {}
