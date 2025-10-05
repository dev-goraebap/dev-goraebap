import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { Response } from 'express';
import { AdminAuthGuard, ZodValidationPipe } from 'src/common';
import { PostQueryService, SeriesQueryService } from 'src/infra/queries';
import { CreateSeriesPostDto, CreateSeriesPostSchema } from './dto/create-series-post.dto';
import { SeriesPostApplicationService } from './series-post-application.service';

@Controller({ path: 'admin/series/:seriesId/posts' })
@UseGuards(AdminAuthGuard)
export class AdminSeriesPostsController {
  constructor(
    private readonly seriesQueryService: SeriesQueryService,
    private readonly postQueryService: PostQueryService,
    private readonly seriesPostAppService: SeriesPostApplicationService,
  ) { }

  @Get()
  async index(@Param('seriesId') seriesId: number, @Req() req: NestMvcReq) {
    const [series, posts] = await Promise.all([
      this.seriesQueryService.getSeriesById(seriesId),
      this.postQueryService.getPostsBySeriesId(seriesId)
    ]);
    return req.view.render('pages/admin/series/posts/index', { series, posts });
  }

  @Get('new')
  async new(@Param('seriesId') seriesId: number, @Query('postTitle') postTitle: string, @Req() req: NestMvcReq) {
    const posts = await this.postQueryService.getPostsExcludedFromSeries(seriesId, postTitle);
    return req.view.render('pages/admin/series/posts/new', {
      seriesId,
      posts,
    });
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateSeriesPostSchema))
  async create(@Param('seriesId') seriesId: number, @Req() req: NestMvcReq, @Body() dto: CreateSeriesPostDto) {
    await this.seriesPostAppService.create(seriesId, dto.postId);
    return req.view.render('pages/admin/series/posts/_success', {
      seriesId,
    });
  }

  @Put('orders')
  async updateOrders(@Req() req: NestMvcReq) {
    await this.seriesPostAppService.updateOrders(req.body?.items);
    req.flash.success('순서 변경 성공!');
  }

  @Delete(':postId')
  async destroy(
    @Param('seriesId') seriesId: number,
    @Param('postId') postId: number,
    @Req() req: NestMvcReq,
    @Res() res: Response,
  ) {
    await this.seriesPostAppService.destroy(seriesId, postId);
    return res.redirect(303, `/admin/series/${seriesId}/posts`);
  }
}
