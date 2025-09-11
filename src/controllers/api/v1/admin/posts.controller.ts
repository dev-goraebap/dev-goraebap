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
  UseGuards,
  UsePipes,
} from '@nestjs/common';

import { CurrentUser, ZodValidationPipe } from 'src/common';
import { AdminAuthGuard } from 'src/modules';
import { UpdatePublishDto, UpdatePublishSchema, UserEntity } from 'src/shared';

import { PostQueryService } from 'src/modules/post/application/services/post-query.service';
import { PostCreationService } from 'src/modules/post/application/orchestrators/post-creation.service';
import { PostUpdateService } from 'src/modules/post/application/orchestrators/post-update.service';
import { PostDeletionService } from 'src/modules/post/application/orchestrators/post-deletion.service';

import { CreatePostDto, UpdatePostDto, CreatePostSchema, UpdatePostSchema } from 'src/modules/post/application/dto/create-or-update-post.dto';
import { GetPostsDTO, GetPostsSchema } from 'src/modules/post/application/dto/get-posts.dto';

@Controller('/api/v1/admin/posts')
@UseGuards(AdminAuthGuard)
export class AdminPostsApiController {
  constructor(
    private readonly postQueryService: PostQueryService,
    private readonly postCreationService: PostCreationService,
    private readonly postUpdateService: PostUpdateService,
    private readonly postDeletionService: PostDeletionService,
  ) {}

  @Get()
  @UsePipes(new ZodValidationPipe(GetPostsSchema))
  async getPosts(@Query() dto: GetPostsDTO) {
    return this.postQueryService.getPosts(dto);
  }

  @Get(':id')
  async getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postQueryService.getPost(id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreatePostSchema))
  async create(@CurrentUser() user: UserEntity, @Body() dto: CreatePostDto) {
    return this.postCreationService.create(user, dto);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(UpdatePostSchema))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
    return this.postUpdateService.update(id, dto);
  }

  @Put(':id/publish')
  @UsePipes(new ZodValidationPipe(UpdatePublishSchema))
  async updatePublish(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishDto) {
    return this.postUpdateService.updatePublish(id, dto);
  }

  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number) {
    return this.postDeletionService.destroy(id);
  }
}