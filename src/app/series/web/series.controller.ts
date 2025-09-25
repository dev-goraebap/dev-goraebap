import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { PostQueryService } from '../services/post-query.service';
import { SeriesQueryService } from '../services/series-query.service';

@Controller({ path: 'series' })
export class SeriesController {

  constructor(
    private readonly seriesQueryService: SeriesQueryService,
    private readonly postQueryService: PostQueryService
  ) { }

  @Get()
  async index(@Req() req: NestMvcReq) {
    const seriesList = await this.seriesQueryService.getSeriesList();
    return req.view.render('pages/series/index', {
      seriesList,
    });
  }

  @Get(':slug')
  async show(@Param('slug') slug: string, @Req() req: NestMvcReq) {
    const seriesItem = await this.seriesQueryService.getSeriesItem(slug);
    const posts = await this.postQueryService.getSeriesPosts({ seriesSlug: slug });
    return req.view.render('pages/series/show', {
      seriesItem,
      posts,
    });
  }

  @Get(':seriesSlug/:postSlug')
  async showPost(@Req() req: NestMvcReq, @Param('seriesSlug') seriesSlug: string, @Param('postSlug') postSlug: string) {
    await this.postCommandService.updateViewCount(postSlug);

    console.log(postSlug, seriesSlug);

    const result = await this.seriesQueryService.getSeriesPost(postSlug, seriesSlug);
    const comments = await this.commentQueryService.getPostComments(postSlug);
    // return req.view.render('pages/series/posts/show', {
    //   ...result,
    //   comments,
    // });
  }

}