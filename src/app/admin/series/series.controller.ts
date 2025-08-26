import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { AdminAuthGuard, CurrentUser, ZodValidationPipe } from 'src/common';
import { UserEntity } from 'src/shared';
import {
  CreateSeriesDto,
  CreateSeriesSchema,
  UpdateSeriesDto,
  UpdateSeriesSchema,
} from './dto/create-or-update-series.dto';
import { GetSeriesDto, GetSeriesSchema } from './dto/get-series.dto';
import { SeriesApplicationService } from './series-application.service';

@Controller({ path: '/admin/series' })
@UseGuards(AdminAuthGuard)
export class SeriesController {
  constructor(private readonly seriesAppService: SeriesApplicationService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(GetSeriesSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetSeriesDto) {
    const series = await this.seriesAppService.getSeriesList(dto);
    if (req.headers['turbo-frame']) {
      return req.view.render('pages/admin/series/_list', { series });
    }
    return req.view.render('pages/admin/series/index', { series });
  }

  @Get('new')
  new(@Req() req: NestMvcReq) {
    if (!req.headers['turbo-frame']) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }
    return req.view.render('pages/admin/series/new');
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateSeriesSchema))
  async create(@Req() req: NestMvcReq, @Body('series') dto: CreateSeriesDto, @CurrentUser() user: UserEntity) {
    await this.seriesAppService.createSeries(user, dto);
    req.flash.success('시리즈를 성공적으로 등록하였습니다.');
    return req.view.render('pages/admin/series/_success');
  }

  @Get(':id/edit')
  async edit(@Param('id') id: number, @Req() req: NestMvcReq) {
    const series = await this.seriesAppService.getSeriesItem(id);
    return req.view.render('pages/admin/series/edit', {
      series,
    });
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(UpdateSeriesSchema))
  async update(
    @Param('id') id: number,
    @Req() req: NestMvcReq,
    @Body('series') dto: UpdateSeriesDto,
  ) {
    await this.seriesAppService.updateSeries(id, dto);
    req.flash.success('시리즈를 성공적으로 변경하였습니다.');
    return req.view.render('pages/admin/series/_success');
  }

  @Delete(':id')
  async destroy(@Param('id') id: number, @Req() req: NestMvcReq, @Res() res: Response) {
    await this.seriesAppService.destroySeries(id);
    req.flash.success('시리즈를 성공적으로 삭제하였습니다.');
    return res.redirect(303, '/admin/series');
  }
}
