import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { AdminAuthGuard, ZodValidationPipe } from 'src/common';
import { CreateSeriesPostDto, CreateSeriesPostSchema } from './dto/create-series-post.dto';
import { SeriesApplicationService } from './series-application.service';

@Controller({ path: 'admin/series/:seriesId/posts' })
@UseGuards(AdminAuthGuard)
export class SeriesPostsController {
  constructor(private readonly seriesAppService: SeriesApplicationService) {}

  @Get()
  async index(@Param('seriesId') seriesId: number, @Req() req: NestMvcReq) {
    const series = await this.seriesAppService.getSeriesItem(seriesId);
    return req.view.render('pages/admin/series/posts/index', { series });
  }

  @Get('new')
  async new(@Param('seriesId') seriesId: number, @Query('postTitle') postTitle: string, @Req() req: NestMvcReq) {
    const posts = await this.seriesAppService.getSeriesPosts(seriesId, postTitle);
    return req.view.render('pages/admin/series/posts/new', {
      seriesId,
      posts,
    });
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateSeriesPostSchema))
  async create(@Param('seriesId') seriesId: number, @Req() req: NestMvcReq, @Body() dto: CreateSeriesPostDto) {
    await this.seriesAppService.addPostToSeries(seriesId, dto.postId);
    return req.view.render('pages/admin/series/posts/_success', {
      seriesId,
    });
  }

  @Put('orders')
  async updateOrders(@Req() req: NestMvcReq) {
    await this.seriesAppService.updatePostOrders(req.body?.items as []);
    req.flash.success('순서 변경 성공!');
  }

  @Delete(':postId')
  async destroy(
    @Param('seriesId') seriesId: number,
    @Param('postId') postId: number,
    @Res() res: Response,
  ) {
    await this.seriesAppService.removePostFromSeries(seriesId, postId);
    return res.redirect(303, `/admin/series/${seriesId}/posts`);
  }
}
