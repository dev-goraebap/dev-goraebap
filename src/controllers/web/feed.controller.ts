import { Controller, Get, Query, Req, Res, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { IsTurboStream, ZodValidationPipe } from 'src/common';
// TODO: Feed 모듈 완성 후 연결
// import { GetPostsDto, GetPostsSchema } from 'src/modules/feed/application/dto/get-posts.dto';
// import { FeedService } from 'src/modules/feed/application/services/feed.service';

@Controller({ path: '' })
export class FeedController {
  // TODO: FeedService를 적절한 모듈로 이동 후 연결
  constructor() {} // private readonly feedService: FeedService

  /**
   * 피드 페이지
   */
  @Get()
  // @UsePipes(new ZodValidationPipe(GetPostsSchema))
  async index(
    @Req() req: NestMvcReq,
    // @Query() dto: GetPostsDto,
    @Res() res: Response,
    @IsTurboStream() isTurboStream: boolean,
  ) {
    // TODO: 새로운 모듈 구조에 맞게 서비스 로직 재구성
    const template = await req.view.render('pages/feed/index', {});
    return res.send(template);
  }
}