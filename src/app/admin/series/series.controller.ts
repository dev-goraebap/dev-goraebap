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
  UploadedFile,
  UseGuards,
  UsePipes,
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
import { SeriesService } from './series.service';
import { CreateSeriesUseCase } from './use-cases/create-series.use-case';
import { DestroySeriesUseCase } from './use-cases/destroy-series.use-case';
import { UpdateSeriesUseCase } from './use-cases/update-series.use-case';

@Controller({ path: '/admin/series' })
@UseGuards(AdminAuthGuard)
export class SeriesController {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly createSeriesUseCase: CreateSeriesUseCase,
    private readonly updateSeriesUseCase: UpdateSeriesUseCase,
    private readonly destroySeriesUseCase: DestroySeriesUseCase
  ) {}

  @Get()
  @UsePipes(new ZodValidationPipe(GetSeriesSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetSeriesDto) {
    const series = await this.seriesService.getSeriesList(dto);
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
  async create(
    @Req() req: NestMvcReq,
    @Body('series') dto: CreateSeriesDto,
    @CurrentUser() user: UserEntity
  ) {
    console.debug(dto);
    await this.createSeriesUseCase.execute(user, dto);
    req.flash.success('시리즈를 성공적으로 등록하였습니다.');
    return req.view.render('pages/admin/series/_success');
  }

  @Get(':id/edit')
  async edit(@Param('id') id: number, @Req() req: NestMvcReq) {
    console.debug(id);
    const series = await this.seriesService.getSeriesItem(id);
    return req.view.render('pages/admin/series/edit', {
      series,
    });
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(UpdateSeriesSchema))
  async update(
    @Param('id') id: number,
    @Req() req: NestMvcReq,
    @UploadedFile() imageFile: Express.Multer.File,
    @Body('series') dto: UpdateSeriesDto,
  ) {
    console.debug(imageFile);
    console.debug(dto);
    await this.updateSeriesUseCase.execute(id, dto);
    req.flash.success('시리즈를 성공적으로 변경하였습니다.');
    return req.view.render('pages/admin/series/_success');
  }

  @Delete(':id')
  async destroy(
    @Param('id') id: number,
    @Req() req: NestMvcReq,
    @Res() res: Response,
  ) {
    await this.destroySeriesUseCase.execute(id);
    req.flash.success('시리즈를 성공적으로 삭제하였습니다.');
    return res.redirect(303, '/admin/series');
  }
}
