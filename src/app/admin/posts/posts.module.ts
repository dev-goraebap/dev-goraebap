import { Module } from '@nestjs/common';

import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostUseCase } from './use-cases/create-post.use-case';
import { DestroyPostUseCase } from './use-cases/destroy-post.use-case';
import { UpdatePostUseCase } from './use-cases/update-post.use-case';

@Module({
  controllers: [PostsController],
  providers: [
    PostsService,
    CreatePostUseCase,
    UpdatePostUseCase,
    DestroyPostUseCase
  ]
})
export class PostsModule {}
