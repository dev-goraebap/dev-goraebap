import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { AdminAuthGuard } from 'src/common';
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
}
