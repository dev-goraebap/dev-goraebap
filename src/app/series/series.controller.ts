import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';
import { SeriesService } from './series.service';

@Controller({ path: 'series' })
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  async index(@Req() req: NestMvcReq) {
    // 실제 데이터 가져오기
    const seriesList = await this.seriesService.getSeriesList();

    return req.view.render('pages/series/index', {
      seriesList,
    });
  }

  @Get(':slug')
  async show(@Param('slug') slug: string, @Req() req: NestMvcReq) {
    await this.seriesService.getSeriesList();
    // 실제 데이터 가져오기
    const seriesItem = await this.seriesService.getSeries(slug);
    const posts = await this.seriesService.getSeriesPosts(slug);

    return req.view.render('pages/series/show', {
      seriesItem,
      posts,
    });
  }
}
