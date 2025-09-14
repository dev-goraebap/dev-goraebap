import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { PostQueryService } from 'src/core/application/post';
import { CreateSeriesPostDto, CreateSeriesPostSchema, SeriesPostCommandService, SeriesQueryService } from 'src/core/application/series';
import { AdminAuthGuard } from 'src/core/presentation/guards';
import { ZodValidationPipe } from 'src/core/presentation/pipes';

@Controller({ path: 'admin/series/:seriesId/posts' })
@UseGuards(AdminAuthGuard)
export class AdminSeriesPostController {
  constructor(
    private readonly seriesQueryService: SeriesQueryService,
    private readonly postQueryService: PostQueryService,
    private readonly seriesPostCommandService: SeriesPostCommandService
  ) {}

  @Get()
  async index(@Param('seriesId') seriesId: number, @Req() req: NestMvcReq) {
    const series = await this.seriesQueryService.getAdminSeriesWithPosts(seriesId);
    return req.view.render('pages/admin/series/posts/index', { series });
  }

  @Get('new')
  async new(@Param('seriesId') seriesId: number, @Query('postTitle') postTitle: string, @Req() req: NestMvcReq) {
    const posts = await this.postQueryService.getAdminPostsExcludeSeriesId(seriesId, postTitle);
    console.log(posts);
    return req.view.render('pages/admin/series/posts/new', {
      seriesId,
      posts,
    });
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateSeriesPostSchema))
  async create(@Param('seriesId') seriesId: number, @Req() req: NestMvcReq, @Body() dto: CreateSeriesPostDto) {
    console.log(dto);
    await this.seriesPostCommandService.create(seriesId, dto.postId);
    return req.view.render('pages/admin/series/posts/_success', {
      seriesId,
    });
  }

  @Put('orders')
  async updateOrders(@Req() req: NestMvcReq) {
    await this.seriesPostCommandService.updateOrders(req.body?.items);
    req.flash.success('순서 변경 성공!');
  }

  @Delete(':postId')
  async destroy(
    @Param('seriesId') seriesId: number,
    @Param('postId') postId: number,
    @Req() req: NestMvcReq,
    @Res() res: Response,
  ) {
    await this.seriesPostCommandService.destroy(seriesId, postId);
    return res.redirect(303, `/admin/series/${seriesId}/posts`);
  }
}