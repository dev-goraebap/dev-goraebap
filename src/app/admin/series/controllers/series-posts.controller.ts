import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { Response } from 'express';
import { AdminAuthGuard, ZodValidationPipe } from 'src/common';
import { CreateSeriesPostDto, CreateSeriesPostSchema } from '../dto/create-series-post.dto';
import { SeriesPostsService } from '../services/series-posts.service';
import { SeriesService } from '../services/series.service';

@Controller({ path: 'admin/series/:seriesId/posts' })
@UseGuards(AdminAuthGuard)
export class SeriesPostsController {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly seriesPostsService: SeriesPostsService,
  ) {}

  @Get()
  async index(@Param('seriesId') seriesId: number, @Req() req: NestMvcReq) {
    const series = await this.seriesService.getSeriesItem(seriesId);
    return req.view.render('pages/admin/series/posts/index', { series });
  }

  @Get('new')
  async new(@Param('seriesId') seriesId: number, @Query('postTitle') postTitle: string, @Req() req: NestMvcReq) {
    const posts = await this.seriesPostsService.getPostsExcludeBy(seriesId, postTitle);
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
    await this.seriesPostsService.create(seriesId, dto.postId);
    return req.view.render('pages/admin/series/posts/_success', {
      seriesId,
    });
  }

  @Put('orders')
  async updateOrders(@Req() req: NestMvcReq) {
    await this.seriesPostsService.updateOrders(req.body?.items);
    req.flash.success('순서 변경 성공!');
  }

  @Delete(':postId')
  async destroy(
    @Param('seriesId') seriesId: number,
    @Param('postId') postId: number,
    @Req() req: NestMvcReq,
    @Res() res: Response,
  ) {
    await this.seriesPostsService.destroy(seriesId, postId);
    return res.redirect(303, `/admin/series/${seriesId}/posts`);
  }
}
