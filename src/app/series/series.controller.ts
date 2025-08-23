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

  @Get(':id')
  async show(@Param('id') id: number, @Req() req: NestMvcReq) {
    await this.seriesService.getSeriesList();
    // 실제 데이터 가져오기
    const seriesItem = await this.seriesService.getSeries(id);
    const posts = await this.seriesService.getSeriesPosts(id);

    return req.view.render('pages/series/show', {
      seriesItem,
      posts,
    });
  }
}
