import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { PostQueryService, SeriesQueryService } from 'src/infra/queries';

@Controller({ path: 'series' })
export class SeriesController {

  constructor(
    private readonly seriesQueryService: SeriesQueryService,
    private readonly postQueryService: PostQueryService
  ) { }

  @Get()
  async index(@Req() req: NestMvcReq) {
    const seriesList = await this.seriesQueryService.getSeriesList();
    return req.view.render('pages/series/index', { seriesList });
  }

  @Get(':slug')
  async show(@Param('slug') slug: string, @Req() req: NestMvcReq) {
    const [seriesItem, posts] = await Promise.all([
      this.seriesQueryService.getSeriesBySlug(slug),
      this.postQueryService.getPostsBySeriesSlug(slug)
    ]);
    return req.view.render('pages/series/show', { seriesItem, posts });
  }
}