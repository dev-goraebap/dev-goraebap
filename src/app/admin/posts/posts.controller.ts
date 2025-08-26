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
import { UserEntity } from 'src/shared';
import { CreatePostDto, CreatePostSchema, UpdatePostDto, UpdatePostSchema } from './dto/create-or-update-post.dto';
import { GetPostsDTO, GetPostsSchema } from './dto/get-posts.dto';
import { UpdatePostPublishDto, UpdatePostPublishSchema } from './dto/update-publish.dto';
import { PostsApplicationService } from './posts-application.service';

@Controller({ path: '/admin/posts' })
@UseGuards(AdminAuthGuard)
export class PostsController {
  constructor(private readonly postsAppService: PostsApplicationService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(GetPostsSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetPostsDTO) {
    const posts = await this.postsAppService.getPosts(dto);

    if (req.headers['turbo-frame']) {
      return req.view.render('pages/admin/posts/_list', { posts });
    }

    return req.view.render('pages/admin/posts/index', {
      posts,
    });
  }

  @Get('new')
  new(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/posts/new');
  }

  @Get(':id')
  async show(@Req() req: NestMvcReq, @Param('id', ParseIntPipe) id: number) {
    const post = await this.postsAppService.getPost(id);
    return req.view.render('pages/admin/posts/show', { post });
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreatePostSchema))
  async create(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @Body('post') dto: CreatePostDto,
    @CurrentUser() user: UserEntity,
  ) {
    await this.postsAppService.createPost(user, dto);
    req.flash.success('게시물 저장 완료');
    return res.redirect('/admin/posts');
  }

  @Get(':id/edit')
  async edit(@Req() req: NestMvcReq, @Param('id', ParseIntPipe) id: number) {
    const post = await this.postsAppService.getPost(id);
    return req.view.render('pages/admin/posts/edit', { post });
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(UpdatePostSchema))
  async update(
    @Req() req: NestMvcReq,
    @Param('id', ParseIntPipe) id: number,
    @Body('post') dto: UpdatePostDto,
    @Res() res: Response,
  ) {
    await this.postsAppService.updatePost(id, dto);
    req.flash.success('게시물 변경 완료');
    return res.redirect(303, '/admin/posts');
  }

  @Put(':id/publish')
  @UsePipes(new ZodValidationPipe(UpdatePostPublishSchema))
  async updatePublish(
    @Req() req: NestMvcReq,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostPublishDto,
    @Res() res: Response,
  ) {
    await this.postsAppService.updatePublish(id, dto);
    req.flash.success('게시물 변경 완료');
    return res.redirect(303, '/admin/posts');
  }

  @Delete(':id')
  async destroy(@Param('id') id: number, @Req() req: NestMvcReq, @Res() res: Response) {
    await this.postsAppService.destroyPost(id);
    req.flash.success('게시물을 성공적으로 삭제하였습니다.');
    return res.redirect(303, '/admin/posts');
  }
}
