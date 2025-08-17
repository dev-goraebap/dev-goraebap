import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';
import { SeriesService } from './series.service';

@Controller({ path: 'series' })
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  async index(@Req() req: NestMvcReq) {
    // 실제 데이터 가져오기
    const series = await this.seriesService.getSeries();

    return req.view.render('pages/series/index', {
      series
    });
  }

  @Get(':id')
  async show(@Param('id') id: string, @Req() req: NestMvcReq) {
    // 실제 데이터 가져오기
    const seriesData = await this.seriesService.getSeriesWithPosts(id);
    
    if (!seriesData) {
      // 404 처리 또는 기본 페이지로 리다이렉트
      return req.view.render('pages/errors/404');
    }
    
    return req.view.render('pages/series/show', {
      series: seriesData,
      posts: seriesData.posts || []
    });
  }
}
