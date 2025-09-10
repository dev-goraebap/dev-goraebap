import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { AdminAuthGuard, CurrentUser, ZodValidationPipe } from 'src/common';
import { UpdatePublishDto, UpdatePublishSchema, UserEntity } from 'src/shared';

// TODO: 새로운 모듈 구조에서 import
import { PostQueryService } from 'src/modules/post/application/services/post-query.service';
import { PostCreationService } from 'src/modules/post/application/orchestrators/post-creation.service';
import { PostUpdateService } from 'src/modules/post/application/orchestrators/post-update.service';
import { PostDeletionService } from 'src/modules/post/application/orchestrators/post-deletion.service';

import { CreatePostDto, UpdatePostDto, CreatePostSchema, UpdatePostSchema } from 'src/modules/post/application/dto/create-or-update-post.dto';
import { GetPostsDTO, GetPostsSchema } from 'src/modules/post/application/dto/get-posts.dto';

@Controller({ path: '/admin/posts' })
@UseGuards(AdminAuthGuard)
export class AdminPostsController {
  constructor(
    private readonly postQueryService: PostQueryService,
    private readonly postCreationService: PostCreationService,
    private readonly postUpdateService: PostUpdateService,
    private readonly postDeletionService: PostDeletionService,
  ) {}

  @Get()
  @UsePipes(new ZodValidationPipe(GetPostsSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetPostsDTO) {
    const postData = await this.postQueryService.getPosts(dto);
    
    return req.view.render('pages/admin/posts/index', {
      ...postData,
    });
  }

  @Get('new')
  async new(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/posts/new', {});
  }

  @Get(':id/edit')
  async edit(@Req() req: NestMvcReq, @Param('id', ParseIntPipe) id: number) {
    const post = await this.postQueryService.getPost(id);
    return req.view.render('pages/admin/posts/edit', { post });
  }

  // API endpoints는 별도의 API 컨트롤러로 이동 예정
}