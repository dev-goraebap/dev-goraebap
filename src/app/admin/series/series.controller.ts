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
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';
import { ZodValidationPipe } from 'src/common';

import {
  CreateOrUpdateSeriesDto,
  CreateOrUpdateSeriesSchema,
} from './dto/create-or-update-series.dto';
import { GetSeriesDto, GetSeriesSchema } from './dto/get-series.dto';

@Controller({ path: '/admin/series' })
export class SeriesController {
  @Get()
  @UsePipes(new ZodValidationPipe(GetSeriesSchema))
  index(@Req() req: NestMvcReq, @Query() dto: GetSeriesDto) {
    console.log(dto);
    const series = [
      {
        id: 1,
        imageUrl: '/public/images/bg01.jpg',
        name: 'nestjs',
        description:
          'alskdfjsadlkfjdsalkfjlasdkfjllsadkfjlasldkfjllasdkjfalsdkjfl',
        relatedPostCount: 6,
        createdAt: new Date(),
      },
      {
        id: 2,
        imageUrl: '/public/images/bg02.jpg',
        name: 'angular',
        description:
          'alskdfjsadlkfjdsalkfjlasdkfjllsadkfjlasldkfjllasdkjfalsdkjfl',
        relatedPostCount: 3,
        createdAt: new Date(),
      },
      {
        id: 3,
        imageUrl: '/public/images/bg03.jpg',
        name: 'js',
        description:
          'alskdfjsadlkfjdsalkfjlasdkfjllsadkfjlasldkfjllasdkjfalsdkjfl',
        relatedPostCount: 10,
        createdAt: new Date(),
      },
      {
        id: 4,
        imageUrl: '/public/images/bg04.jpg',
        name: 'nodejs',
        description:
          'alskdfjsadlkfjdsalkfjlasdkfjllsadkfjlasldkfjllasdkjfalsdkjfl',
        relatedPostCount: 23,
        createdAt: new Date(),
      },
    ];

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
  @UseInterceptors(FileInterceptor('image'))
  @UsePipes(new ZodValidationPipe(CreateOrUpdateSeriesSchema))
  create(
    @Req() req: NestMvcReq,
    @UploadedFile() imageFile: Express.Multer.File,
    @Body('series') dto: CreateOrUpdateSeriesDto,
  ) {
    console.log(imageFile);
    console.log(dto);
    req.flash.success('시리즈를 성공적으로 등록하였습니다.');
    return req.view.render('pages/admin/series/_success');
  }

  @Get(':id/edit')
  edit(@Param('id') id: number, @Req() req: NestMvcReq) {
    console.log(id);
    const series = {
      id: 1,
      imageUrl: '/public/images/bg04.jpg',
      name: 'nodejs',
      description:
        'alskdfjsadlkfjdsalkfjlasdkfjllsadkfjlasldkfjllasdkjfalsdkjfl',
      relatedPostCount: 23,
      createdAt: new Date(),
    };
    return req.view.render('pages/admin/series/edit', {
      series,
    });
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  @UsePipes(new ZodValidationPipe(CreateOrUpdateSeriesSchema))
  update(
    @Param('id') id: number,
    @Req() req: NestMvcReq,
    @UploadedFile() imageFile: Express.Multer.File,
    @Body('series') dto: CreateOrUpdateSeriesDto,
  ) {
    console.log(imageFile);
    console.log(dto);
    req.flash.success('시리즈를 성공적으로 변경하였습니다.');
    return req.view.render('pages/admin/series/_success');
  }

  @Delete(':id')
  destroy(
    @Param('id') id: number,
    @Req() req: NestMvcReq,
    @Res() res: Response,
  ) {
    req.flash.success('시리즈를 성공적으로 삭제하였습니다.');
    return res.redirect(303, '/admin/series');
  }
}
