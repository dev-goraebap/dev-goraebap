import { Controller, Get, Query, Req, Res, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { GetFeedPostsDto, GetFeedPostsSchema, PostFeedService } from 'src/core/application/post';
import { IsTurboStream } from '../../decorators';
import { ZodValidationPipe } from '../../pipes';

@Controller({ path: '' })
export class FeedController {
  constructor(private readonly postFeedService: PostFeedService) { }

  /**
   * 피드 페이지
   */
  @Get()
  @UsePipes(new ZodValidationPipe(GetFeedPostsSchema))
  async index(
    @Req() req: NestMvcReq,
    @Query() dto: GetFeedPostsDto,
    @Res() res: Response,
    @IsTurboStream() isTurboStream: boolean,
  ) {
    // 커서가 있는 경우(더보기)의 경우 터보 스트림 응답
    // 페이지 교체가 아니라 데이터를 아래 쌓아야하기 때문
    if (isTurboStream && dto.cursor) {
      const pageData = await this.postFeedService.getFeedPageData(dto, true);
      res.setHeader('Content-Type', 'text/vnd.turbo-stream.html');
      const template = await req.view.render('pages/feed/posts/_list_append', pageData);
      return res.send(template);
    }

    const pageData = await this.postFeedService.getFeedPageData(dto);
    const template = await req.view.render('pages/feed/index', pageData);
    return res.send(template);
  }
}