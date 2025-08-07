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
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { ZodValidationPipe } from 'src/common';
import { CreatePostDto, CreatePostSchema } from './dto/create-post.dto';
import { GetPostsDTO, GetPostsSchema } from './dto/get-posts.dto';
import { UpdatePostDto, UpdatePostSchema } from './dto/update-post.dto';
import { PostsService } from './posts.service';
import { CreatePostUseCase } from './use-cases/create-post.use-case';
import { DestroyPostUseCase } from './use-cases/destroy-post.use-case';
import { UpdatePostUseCase } from './use-cases/update-post.use-case';

@Controller({ path: '/admin/posts' })
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly destroyPostUseCase: DestroyPostUseCase,
  ) {}

  @Get()
  @UsePipes(new ZodValidationPipe(GetPostsSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetPostsDTO) {
    const posts = await this.postsService.getPosts(dto);
    console.log(posts);

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
    const post = await this.postsService.getPost(id);
    console.log(post);
    return req.view.render('pages/admin/posts/show', { post });
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreatePostSchema))
  async create(
    @Req() req: NestMvcReq,
    @Body('post') dto: CreatePostDto,
    @Res() res: Response,
  ) {
    console.log(dto);
    await this.createPostUseCase.execute(dto);
    req.flash.success('게시물 저장 완료');
    return res.redirect('/admin/posts');
  }

  @Get(':id/edit')
  async edit(@Req() req: NestMvcReq, @Param('id', ParseIntPipe) id: number) {
    const post = await this.postsService.getPost(id);
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
    console.log(dto);
    await this.updatePostUseCase.execute(id, dto);
    req.flash.success('게시물 변경 완료');
    return res.redirect(303, '/admin/posts');
  }

  @Delete(':id')
  async destroy(
    @Param('id') id: number,
    @Req() req: NestMvcReq,
    @Res() res: Response,
  ) {
    await this.destroyPostUseCase.execute(id);
    req.flash.success('게시물을 성공적으로 삭제하였습니다.');
    return res.redirect(303, '/admin/posts');
  }
}
