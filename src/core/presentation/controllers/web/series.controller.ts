import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { CommentQueryService } from 'src/core/application/comment';
import { PostCommandService } from 'src/core/application/post';
import { SeriesQueryService } from 'src/core/application/series';

@Controller({ path: 'series' })
export class SeriesController {

  constructor(
    private readonly postCommandService: PostCommandService,
    private readonly commentQueryService: CommentQueryService,
    private readonly seriesQueryService: SeriesQueryService,
  ) {}

  @Get()
  async index(@Req() req: NestMvcReq) {
    const seriesList = await this.seriesQueryService.getSeriesList();
    return req.view.render('pages/series/index', {
      seriesList,
    });
  }

  @Get(':slug')
  async show(@Param('slug') slug: string, @Req() req: NestMvcReq) {
    const seriesItem = await this.seriesQueryService.getSeries(slug);
    const posts = await this.seriesQueryService.getSeriesPosts(slug);

    return req.view.render('pages/series/show', {
      seriesItem,
      posts,
    });
  }

  @Get(':seriesSlug/:postSlug')
  async showPost(@Req() req: NestMvcReq, @Param('seriesSlug') seriesSlug: string, @Param('postSlug') postSlug: string) {
    await this.postCommandService.updateViewCount(postSlug);

    const result = await this.seriesQueryService.getSeriesPost(postSlug, seriesSlug);
    const comments = await this.commentQueryService.getPostComments(postSlug);
    return req.view.render('pages/series/posts/show', {
      ...result,
      comments,
    });
  }
}