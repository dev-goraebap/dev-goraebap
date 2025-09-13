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
import { UpdatePublishDto, UpdatePublishSchema } from 'src/core/application/_concern';

import { CreatePostDto, CreatePostSchema, PostCommandService, PostQueryService, UpdatePostDto, UpdatePostSchema } from 'src/core/application/post';
import { GetAdminPostsDTO, GetAdminPostsSchema } from 'src/core/infrastructure/dto';
import { UserEntity } from 'src/core/infrastructure/entities';
import { CurrentUser } from 'src/core/presentation/decorators';
import { AdminAuthGuard } from 'src/core/presentation/guards';
import { ZodValidationPipe } from 'src/core/presentation/pipes';

@Controller({ path: '/admin/posts' })
@UseGuards(AdminAuthGuard)
export class AdminPostController {
  constructor(
    private readonly postQueryService: PostQueryService,
    private readonly postCommandService: PostCommandService
  ) { }

  @Get()
  @UsePipes(new ZodValidationPipe(GetAdminPostsSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetAdminPostsDTO) {
    const postData = await this.postQueryService.getAdminPosts(dto);

    return req.view.render('pages/admin/posts/index', {
      ...postData,
    });
  }

  @Get('new')
  new(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/posts/new');
  }

  @Get(':id')
  async show(@Req() req: NestMvcReq, @Param('id', ParseIntPipe) id: number) {
    const post = await this.postQueryService.getAdminPost(id);
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
    await this.postCommandService.createPost(user, dto);
    req.flash.success('게시물 저장 완료');
    return res.redirect('/admin/posts');
  }

  @Get(':id/edit')
  async edit(@Req() req: NestMvcReq, @Param('id', ParseIntPipe) id: number) {
    const post = await this.postQueryService.getAdminPost(id);
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
    await this.postCommandService.updatePost(id, dto);
    req.flash.success('게시물 변경 완료');
    return res.redirect(303, '/admin/posts');
  }

  @Put(':id/publish')
  @UsePipes(new ZodValidationPipe(UpdatePublishSchema))
  async updatePublish(
    @Req() req: NestMvcReq,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePublishDto,
    @Res() res: Response,
  ) {
    await this.postCommandService.updatePublish(id, dto);
    req.flash.success('게시물 변경 완료');
    return res.redirect(303, '/admin/posts');
  }

  @Delete(':id')
  async destroy(@Param('id') id: number, @Req() req: NestMvcReq, @Res() res: Response) {
    await this.postCommandService.destroyPost(id);
    req.flash.success('게시물을 성공적으로 삭제하였습니다.');
    return res.redirect(303, '/admin/posts');
  }
}