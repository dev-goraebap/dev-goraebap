import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { CreateSeriesDto, CreateSeriesSchema, GetSeriesDto, GetSeriesSchema, SeriesCommandService, SeriesQueryService, UpdateSeriesDto, UpdateSeriesSchema } from 'src/core/application/series';
import { UserEntity } from 'src/core/infrastructure/entities';
import { CurrentUser } from 'src/core/presentation/decorators';
import { AdminAuthGuard } from 'src/core/presentation/guards';
import { ZodValidationPipe } from 'src/core/presentation/pipes';
import { UpdatePublishDto, UpdatePublishSchema } from 'src/shared';

@Controller({ path: '/admin/series' })
@UseGuards(AdminAuthGuard)
export class AdminSeriesController {
  constructor(
    private readonly seriesQueryService: SeriesQueryService,
    private readonly seriesAppService: SeriesCommandService
  ) { }

  @Get()
  @UsePipes(new ZodValidationPipe(GetSeriesSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetSeriesDto) {
    const seriesData = await this.seriesQueryService.findSeriesList(dto);
    return req.view.render('pages/admin/series/index', { ...seriesData });
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
    const series = await this.seriesQueryService.findSeriesItem(id);
    return req.view.render('pages/admin/series/edit', {
      series,
    });
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(UpdateSeriesSchema))
  async update(@Param('id') id: number, @Req() req: NestMvcReq, @Body('series') dto: UpdateSeriesDto) {
    await this.seriesAppService.updateSeries(id, dto);
    req.flash.success('시리즈를 성공적으로 변경하였습니다.');
    return req.view.render('pages/admin/series/_success');
  }

  @Put(':id/publish')
  @UsePipes(new ZodValidationPipe(UpdatePublishSchema))
  async updatePublish(
    @Req() req: NestMvcReq,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePublishDto,
    @Res() res: Response,
  ) {
    await this.seriesAppService.updatePublish(id, dto);
    req.flash.success('시리즈 변경 완료');
    return res.redirect(303, '/admin/series');
  }

  @Delete(':id')
  async destroy(@Param('id') id: number, @Req() req: NestMvcReq, @Res() res: Response) {
    await this.seriesAppService.destroySeries(id);
    req.flash.success('시리즈를 성공적으로 삭제하였습니다.');
    return res.redirect(303, '/admin/series');
  }
}
